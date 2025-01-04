import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import FollowTheSignsOutlinedIcon from "@mui/icons-material/FollowTheSignsOutlined"; // New icon import
import BusinessIcon from "@mui/icons-material/Business";
import "./sidebar.css";

// Add your desired brand icon (for now, using FollowTheSignsOutlinedIcon)
const iconMapping = {
  Dashboard: <HomeOutlinedIcon />,
  Inquiry: <PeopleOutlinedIcon />,
  Role: <ContactsOutlinedIcon />,
  Product: <ReceiptOutlinedIcon />,
  User: <PersonOutlinedIcon />,
  Consumer: <CalendarTodayOutlinedIcon />,
  Consultant: <HelpOutlineOutlinedIcon />,
  GenralFollowUp: <FollowTheSignsOutlinedIcon />, // New icon
  Brand: <BusinessIcon/>, // Brand icon added here
};

const Item = ({ title, to, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      className={selected === title ? "active" : ""}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={iconMapping[title]} // Icon is selected from the mapping object
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation(); // Get current location
  const [selected, setSelected] = useState("");
  const userRole = localStorage.getItem("userRole");

  // Set selected based on the current path
  useEffect(() => {
    const currentPath = location.pathname.split("/")[1]; // Get the path after the first slash
    setSelected(currentPath.charAt(0).toUpperCase() + currentPath.slice(1)); // Capitalize the first letter
  }, [location.pathname]);

  return (
    <Box
      sx={{
        "--sidebar-background": colors.primary[400],
        "--menu-item-color": colors.grey[100],
      }}
      className="sidebar m-1"
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            className="menu-item-custom"
          >
            {!isCollapsed && (
              <Box className="logo-box">
                <Typography variant="h3" color={colors.grey[100]}>
                  {/* Add text if needed */}
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box className="profile-box">
              <img
                alt="profile-user"
                src={`../../assets/user.png`}
                className="profile-img"
              />
            </Box>
          )}

          <Box className="menu-box">
            {["Dashboard", "Inquiry", "Product", "Consumer", "Consultant", "GenralFollowUp", "Brand"].map((title) => (
              <Item
                key={title}
                title={title}
                to={`/${title.toLowerCase()}`} // Example: convert title to lowercase for URL
                selected={selected}
                setSelected={setSelected}
              />
            ))}

            {/* Conditionally render Role and User based on userRole */}
            {userRole !== "USER" && (
              <>
                <Item
                  title="Role"
                  to="/role"
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="User"
                  to="/user"
                  selected={selected}
                  setSelected={setSelected}
                />
              </>
            )}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
