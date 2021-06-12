import { pool } from './pool.js';

export const updateProductAr = async(productId, arUrl, fileName) => {
  try {
    const [result] = await pool.query('UPDATE product SET 3d_model_url = ?, 3d_model_name = ? WHERE id = ?', [arUrl, fileName, productId]);
    return {
      status: 'success',
    };
  } catch(err) {
    return {
      status: 'error',
      err,
    };
  } 
};

export const getCompanyIdByProductId = async(productId) => {
  try {
    const [result] = await pool.query('SELECT company_id FROM product WHERE id = ?', productId);
    return {
      status: 'success',
      data: result[0].company_id,
    };
  } catch(err) {
    return {
      status: 'error',
      err,
    };
  } 
};

export const updateStatus = async(productId, status) => {
  try {
    const [result] = await pool.query('UPDATE product SET 3d_model_status = ? WHERE id = ?', [status, productId]);
    return {
      status: 'success',
    }
  } catch(err) {
    return {
      status: 'error',
      err,
    };
  }
};

export const getStatus = async(productId) => {
  try {
    const [result] = await pool.query('SELECT 3d_model_status as status FROM product WHERE id = ?', productId);
    return {
      status: 'success',
      data: result[0].status,
    }
  } catch(err) {
    return {
      status: 'error',
      err,
    }
  }
};

export const delAr = async(productId) => {
  try {
    const [result] = await pool.query('UPDATE product SET 3d_model_url = null, 3d_model_name = null, 3d_model_status = null WHERE id = ?', productId);
    return {
      status: 'success',
    };
  } catch (err) {
    console.log(err);
    return {
      status: 'error',
      err,
    };
  }
};

export const addProductAr = async (
  id,
  originalUrl,
  textureUrl,
) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM original_ar WHERE product_id = ?', id);
    const addArQuery = 'INSERT INTO original_ar(product_id, main_path, texture_path) VALUES ?';
    const values = [];
    if (textureUrl.length > 0) {
      textureUrl.forEach((texturePath) => {
        const value = [];
        value.push(id, originalUrl, texturePath);
        values.push(value);
      });
    } else {
      const value = [];
      value.push(id, originalUrl, null);
      values.push(value);
    }
    await conn.query(addArQuery, [values]);
    await conn.commit();
    return {
      status: 'success',
    }
  } catch (err) {
    await conn.rollback();
    return {
      status: 'error',
      err,
    }
  } finally {
    conn.release();
  }
};