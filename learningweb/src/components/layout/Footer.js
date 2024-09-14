import React from "react";

const Footer = () => {
  return (
    <div className="my-5">
      <footer className="text-center text-white bg-success w-100">
        <div className="container p-4 pb-0">
          <section>
            <div className="row justify-content-center">
              <div className="col-12 col-md-3 mt-3">
                <h6 className="text-uppercase mb-4 fw-bold">Products</h6>
                <p>
                  <a href="https://mdbootstrap.com" className="text-white">
                    MDBootstrap
                  </a>
                </p>
                <p>
                  <a href="https://wordpress.com" className="text-white">
                    MDWordPress
                  </a>
                </p>
                <p>
                  <a href="https://brandflow.io" className="text-white">
                    BrandFlow
                  </a>
                </p>
                <p>
                  <a href="https://angular.io" className="text-white">
                    Bootstrap Angular
                  </a>
                </p>
              </div>

              <div className="col-12 col-md-4 mt-3">
                <h6 className="text-uppercase mb-4 fw-bold">Liên hệ</h6>
                <p>
                  <i className="fas fa-home me-3"></i> 36 Phan Huy Thực, Tân
                  Kiểng, Quận 7, TP. Hồ Chí Minh
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
                  <a
                    href="https://facebook.com"
                    className="text-white bg-primary p-2 rounded-circle"
                    aria-label="Facebook"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a
                    href="https://twitter.com"
                    className="text-white bg-info p-2 rounded-circle"
                    aria-label="Twitter"
                  >
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a
                    href="https://google.com"
                    className="text-white bg-danger p-2 rounded-circle"
                    aria-label="Google"
                  >
                    <i className="fab fa-google"></i>
                  </a>
                  <a
                    href="https://instagram.com"
                    className="text-white bg-warning p-2 rounded-circle"
                    aria-label="Instagram"
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a
                    href="https://linkedin.com"
                    className="text-white bg-primary p-2 rounded-circle"
                    aria-label="LinkedIn"
                  >
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a
                    href="https://github.com"
                    className="text-white bg-dark p-2 rounded-circle"
                    aria-label="Github"
                  >
                    <i className="fab fa-github"></i>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="text-center p-3 bg-dark bg-opacity-20">
          © 2024 Copyright:
            LearnIt 2151050441
          
        </div>
      </footer>
    </div>
  );
};

export default Footer;
