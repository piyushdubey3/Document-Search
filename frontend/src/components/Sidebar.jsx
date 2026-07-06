import { NavLink } from "react-router-dom";
import {
  FaHouse,
  FaMagnifyingGlass,
  FaCloudArrowUp,
  FaFolderOpen,
} from "react-icons/fa6";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>DocSearch</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/">
          <FaHouse className="nav-icon" />
          <span>Home</span>
        </NavLink>

        <NavLink to="/search">
          <FaMagnifyingGlass className="nav-icon" />
          <span>Search</span>
        </NavLink>

        <NavLink to="/upload">
          <FaCloudArrowUp className="nav-icon" />
          <span>Upload Documents</span>
        </NavLink>

        <NavLink to="/documents">
          <FaFolderOpen className="nav-icon" />
          <span>Documents</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;