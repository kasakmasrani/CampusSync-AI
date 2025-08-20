
import { Link } from "react-router-dom";
import { Calendar, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex flex-col items-center md:items-start space-y-2 md:flex-row md:space-x-2 md:space-y-0 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">CampusSync AI</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              AI-powered event management platform designed to enhance student engagement 
              and streamline event organization for educational institutions.
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-gray-400 hover:text-white transition-colors">
                  Browse Events
                </Link>
              </li>
             
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/support#help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/support#privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/support#terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/support#faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 CampusSync AI. All rights reserved. Built with ❤️ for educational communities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
