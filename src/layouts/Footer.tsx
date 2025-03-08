const Footer = () => {
    return (
      <footer className="bg-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between text-black">
          {/* Contact */}
          <div className="mb-6 md:mb-0">
            <h3 className="font-bold">Contact:</h3>
            <p>Email: 22520114@gm.uit.edu.vn</p>
            <p>Phone: 099 9999 9999</p>
            <p>
              Address: Đường Hàn Thuyên, khu phố 6 P, Thủ Đức, Thành phố Hồ Chí Minh
            </p>
          </div>

          {/* Social Network */}
          <div>
            <h3 className="font-bold">Social Network</h3>
            <ul>
              <li>📘 Facebook</li>
              <li>📸 Instagram</li>
              <li>🐙 Github</li>
            </ul>
          </div>
  
          {/* Directional */}
          <div className="mb-6 md:mb-0">
            <h3 className="font-bold">Developed by</h3>
            <ul>
              <li>Nguyễn Văn Duy Bảo</li>
            </ul>
          </div>
  
          
        </div>
      </footer>
    );
  };
  
  export default Footer;
  