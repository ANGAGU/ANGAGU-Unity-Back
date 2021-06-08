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
}