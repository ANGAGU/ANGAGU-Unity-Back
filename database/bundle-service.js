import { pool } from './pool.js';

export const updateProductAr = async(productId, arUrl, fileName) => {
  try {
    const [result] = await pool.query('UPDATE product SET 3d_model_url = ?, 3d_model_name = ? WHERE id = ?', [arUrl, fileName, productId]);
    console.log(result);
    return {
      status: 'success',
    }
  } catch(err) {
    console.log(err);
    return {
      status: 'error',
      err,
    }
  } 
};