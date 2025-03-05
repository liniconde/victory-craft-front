import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import "./styles.css";
import { useAuth } from "../../context/AuthContext";

const AppNavbar: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const navigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <Navbar expand="lg" className="navbar">
      <Container>
        <Navbar.Brand
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          FieldKing
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate("/fields")}>Fields</Nav.Link>
            <Nav.Link onClick={() => navigate("/reservations")}>
              Reservations
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/slots")}>Slots</Nav.Link>
            {isAuthenticated && (
              <Nav.Link onClick={() => navigate("/my-reservations")}>
                My Reservations
              </Nav.Link>
            )}
            <Nav.Link onClick={() => navigate("/users")}>Users</Nav.Link>
            <NavDropdown title="More" id="basic-nav-dropdown">
              <NavDropdown.Item onClick={() => navigate("/profile")}>
                Profile
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => navigate("/settings")}>
                Settings
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={() => navigate("/logout")}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
