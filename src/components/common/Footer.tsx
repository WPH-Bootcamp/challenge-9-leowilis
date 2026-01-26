import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-[#1a1d29] text-neutral-25 py-12 md:py-20 px-4 md:px-30">
      <div className="flex flex-wrap gap-y-6 md:gap-40 md:justify-around">
        {/* Left Section */}
        <div className="w-full md:w-90 flex flex-col gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <img
              src="/images/common/logo-foody.svg"
              className="w-10.5 h-10.5"
              alt="logo"
            />
            <span className="text-[32px] font-extrabold leading-7">Foody</span>
          </div>

          <p className="text-neutral-25 text-sm leading-7 -tracking-[0.02em]">
            Enjoy homemade flavors & chef's signature dishes, freshly prepared
            every day. Order online or visit our nearest branch.
          </p>

          <div className="flex flex-col gap-5">
            <h3 className="font-semibold text-sm leading-7 -tracking-[0.02em]">
              Follow on Social Media
            </h3>
            <div className="flex gap-3">
              <img
                src="/images/common/facebook.svg"
                alt="Facebook"
                className="h-10 w-10"
              />
              <img
                src="/images/common/instagram.svg"
                alt="Instagram"
                className="h-10 w-10"
              />
              <img
                src="/images/common/linkedin.svg"
                alt="Twitter"
                className="h-10 w-10"
              />
              <img
                src="/images/common/tiktok.svg"
                alt="LinkedIn"
                className="h-10 w-10"
              />
            </div>
          </div>
        </div>

        <div className="w-1/2  md:flex-1 flex flex-col md:ml-[5%] gap-4 ">
          <h3 className="font-extrabold text-sm leading-7 md:text-base md:leading-7.5">
            Explore
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="font-normal text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[-0.02em]"
              >
                All Food
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-normal text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[-0.02em]"
              >
                Nearby
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-normal text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[-0.02em]"
              >
                Discount
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-normal text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[-0.02em]"
              >
                Best Seller
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-normal text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[-0.02em]"
              >
                Delivery
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-normal text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[-0.02em]"
              >
                Lunch
              </a>
            </li>
          </ul>
        </div>

        {/* Right Section */}
        <div className="w-1/2  md:flex-1 flex flex-col gap-4 ">
          <h3 className="font-extrabold text-sm leading-7 md:text-base md:leading-7.5">
            Help
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="font-normal text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[-0.02em]"
              >
                How to Order
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-normal text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[-0.02em]"
              >
                Payment Methods
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-normal text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[-0.02em]"
              >
                Track My Order
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-normal text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[-0.02em]"
              >
                FAQ
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-normal text-sm leading-7 -tracking-[0.02em] md:text-base md:leading-7.5 md:-tracking-[-0.02em]"
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
