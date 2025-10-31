const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const repository = require('./postgre_repository');
const { baseResponse, mappingError, mappingSuccess } = require('../../utils');
const { decodeToken } = require('../../utils/auth');

const ROOT_DIR = path.join(__dirname, '../../..');
const TERM_CONTENT_FOLDER = path.join(ROOT_DIR, 'uploads/term_contents');

const ensureDirectory = async (dirPath) => {
  await fs.promises.mkdir(dirPath, { recursive: true });
};

const sanitizeFileName = (fileName) => {
  if (!fileName) return 'term_content';
  return fileName
    .toString()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .toLowerCase();
};

const normalizeJsonPayload = (payload) => {
  if (payload === null || payload === undefined) {
    return {};
  }

  if (typeof payload === 'object') {
    return payload;
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (!trimmed) {
      return {};
    }

    try {
      return JSON.parse(trimmed);
    } catch (error) {
      return trimmed;
    }
  }

  return payload;
};

const writeJsonFile = async (manageQuotationNo, termContentId, payload) => {
  await ensureDirectory(TERM_CONTENT_FOLDER);

  const sanitizedQuotationNo = sanitizeFileName(manageQuotationNo || 'term_content');
  const fileName = `${sanitizedQuotationNo}_${termContentId}.json`;
  const absolutePath = path.join(TERM_CONTENT_FOLDER, fileName);
  const relativePath = path.relative(ROOT_DIR, absolutePath);

  const dataToWrite = normalizeJsonPayload(payload);
  const fileContent = JSON.stringify(dataToWrite, null, 2);

  await fs.promises.writeFile(absolutePath, fileContent, 'utf8');

  return relativePath.replace(/\\/g, '/');
};

const deleteJsonFile = async (relativePath) => {
  if (!relativePath) {
    return;
  }

  const absolutePath = path.join(ROOT_DIR, relativePath);
  try {
    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const readJsonFile = async (relativePath) => {
  if (!relativePath) {
    return {};
  }

  const absolutePath = path.join(ROOT_DIR, relativePath);
  try {
    const content = await fs.promises.readFile(absolutePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    if (error.name === 'SyntaxError') {
      return {};
    }

    throw error;
  }
};

const mapSortBy = (sortBy) => {
  const mapping = {
    created_at: 'term_contents.created_at',
    manage_quotation_no: 'manage_quotations.manage_quotation_no'
  };
  return mapping[sortBy] || 'term_contents.created_at';
};

const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.body;

    const offset = (page - 1) * limit;

    const params = {
      page,
      limit,
      offset,
      search,
      sortBy: mapSortBy(sort_by),
      sortOrder: sort_order
    };

    const data = await repository.findAll(params);
    const response = mappingSuccess('Data berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await repository.findById(id);

    if (!data) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    const payload = await readJsonFile(data.term_content_directory);
    data.term_content_payload = payload;

    const response = mappingSuccess('Data berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

const create = async (req, res) => {
  let relativePath = null;

  try {
    const tokenData = decodeToken('created', req);
    const { manage_quotation_no, term_content_directory } = req.body;

    const manageQuotation = await repository.findManageQuotationByNo(manage_quotation_no);
    if (!manageQuotation) {
      const response = mappingError('Manage quotation not found', 404);
      return baseResponse(res, response);
    }

    const termContentId = uuidv4();

    relativePath = await writeJsonFile(
      manageQuotation.manage_quotation_no,
      termContentId,
      term_content_directory
    );

    const payload = {
      term_content_id: termContentId,
      manage_quotation_id: manageQuotation.manage_quotation_id,
      term_content_directory: relativePath,
      created_by: tokenData.created_by
    };

    await repository.create(payload);
    const data = await repository.findById(termContentId);
    if (data) {
      data.term_content_payload = await readJsonFile(data.term_content_directory);
    }
    const response = mappingSuccess('Data berhasil dibuat', data, 201);
    return baseResponse(res, response);
  } catch (error) {
    if (relativePath) {
      try {
        await deleteJsonFile(relativePath);
      } catch (cleanupError) {
        console.error('Gagal menghapus file term content saat rollback create:', cleanupError);
      }
    }

    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

const update = async (req, res) => {
  let newRelativePath = null;
  let existing = null;

  try {
    const { id } = req.params;
    const tokenData = decodeToken('updated', req);
    const { manage_quotation_no, term_content_directory } = req.body;

    existing = await repository.findById(id);
    if (!existing) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    let manageQuotation = null;
    if (manage_quotation_no) {
      manageQuotation = await repository.findManageQuotationByNo(manage_quotation_no);
      if (!manageQuotation) {
        const response = mappingError('Manage quotation not found', 404);
        return baseResponse(res, response);
      }
    } else {
      manageQuotation = {
        manage_quotation_id: existing.manage_quotation_id,
        manage_quotation_no: existing.manage_quotation_no
      };
    }

    const payloadSource = term_content_directory !== undefined
      ? term_content_directory
      : await readJsonFile(existing.term_content_directory);

    newRelativePath = await writeJsonFile(
      manageQuotation.manage_quotation_no,
      existing.term_content_id,
      payloadSource
    );

    const payload = {
      manage_quotation_id: manageQuotation.manage_quotation_id,
      term_content_directory: newRelativePath,
      updated_by: tokenData.updated_by
    };

    await repository.update(id, payload);

    if (existing.term_content_directory && existing.term_content_directory !== newRelativePath) {
      await deleteJsonFile(existing.term_content_directory);
    }

    const data = await repository.findById(id);
    if (data) {
      data.term_content_payload = await readJsonFile(data.term_content_directory);
    }
    const response = mappingSuccess('Data berhasil diperbarui', data);
    return baseResponse(res, response);
  } catch (error) {
    if (newRelativePath && existing && existing.term_content_directory !== newRelativePath) {
      try {
        await deleteJsonFile(newRelativePath);
      } catch (cleanupError) {
        console.error('Gagal menghapus file term content saat rollback update:', cleanupError);
      }
    }

    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const tokenData = decodeToken('deleted', req);

    const existing = await repository.findById(id);
    if (!existing) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    const result = await repository.remove(id, {
      deleted_by: tokenData.deleted_by
    });

    if (!result) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    if (existing.term_content_directory) {
      try {
        await deleteJsonFile(existing.term_content_directory);
      } catch (cleanupError) {
        console.error('Gagal menghapus file term content saat delete:', cleanupError);
      }
    }

    const response = mappingSuccess('Data berhasil dihapus', result);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};


