import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPIs, endpoints } from "../../configs/APIs";
import cookie from "react-cookies";

const Footer = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    front_degree_image: null,
    back_degree_image: null,
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const toggleModal = () => {
    const token = cookie.load("authToken");

    if (!token) {
      navigate("/login");
    } else {
      setShowModal(!showModal);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    const apiUrl = endpoints["teacher-register"];
    const api = authAPIs();

    const data = new FormData();
    data.append("front_degree_image", formData.front_degree_image);
    data.append("back_degree_image", formData.back_degree_image);

    try {
      const response = await api.post(apiUrl, data);
      if (response.status === 201) {
        setSuccessMessage("Đăng ký làm giáo viên thành công!");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-5">
      <footer className="text-center text-white bg-success w-100">
        <div className="container p-4 pb-0">
          <section>
            <div className="row justify-content-center">
              <div className="col-12 col-md-3 mt-3">
                <h6 className="text-uppercase mb-4 fw-bold">Đăng ký</h6>
                <p>
                  <span
                    className="text-white"
                    onClick={toggleModal}
                    style={{ cursor: 'pointer', textDecoration: 'none' }}
                  >
                    Đăng ký làm giáo viên
                  </span>
                </p>
              </div>

              <div className="col-12 col-md-4 mt-3">
                <h6 className="text-uppercase mb-4 fw-bold">Liên hệ</h6>
                <p>
                  <i className="fas fa-home me-3"></i> 36 Phan Huy Thực, Tân Kiểng, Quận 7, TP. Hồ Chí Minh
                </p>
                <p>
                  <i className="fas fa-envelope me-3"></i> thuanpmt0711@gmail.com
                </p>
                <p>
                  <i className="fas fa-phone me-3"></i> +84 364646138
                </p>
              </div>

              <div className="col-12 col-md-3 mt-3">
                <h6 className="text-uppercase mb-4 fw-bold">Theo dõi ngay</h6>
                <div className="d-flex justify-content-center gap-2">
                  {/* Social Media Icons */}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="text-center p-3 bg-dark bg-opacity-20">
          © 2024 Copyright: LearnIt 2151050441
        </div>
      </footer>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Đăng ký làm giáo viên</h5>
                <button
                  type="button"
                  className="close"
                  onClick={toggleModal}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="front_degree_image">Ảnh bằng cấp mặt trước:</label>
                    <input
                      type="file"
                      className="form-control"
                      id="front_degree_image"
                      name="front_degree_image"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                  <div className="form-group mt-3">
                    <label htmlFor="back_degree_image">Ảnh bằng cấp mặt sau:</label>
                    <input
                      type="file"
                      className="form-control"
                      id="back_degree_image"
                      name="back_degree_image"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                  {error && <p className="text-danger mt-3">{error}</p>}
                  {successMessage && <p className="text-success mt-3">{successMessage}</p>}
                  <div className="modal-footer mt-3">
                    <button type="button" className="btn btn-secondary" onClick={toggleModal}>
                      Đóng
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang gửi...
                        </>
                      ) : (
                        'Gửi đăng ký'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Footer;