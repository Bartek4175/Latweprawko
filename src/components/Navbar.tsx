import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import '../styles/Navbar.css';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const NavigationBar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <Navbar bg="dark" expand="lg" variant="dark" fixed="top">
      <Navbar.Brand as={Link} to="/">
        LatwePrawko
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/pricing">Cennik</Nav.Link>
          {user && (
            <>
              <Nav.Link as={Link} to="/tests">Testy</Nav.Link>
              <Nav.Link as={Link} to="/learn">Nauka</Nav.Link>
              <Nav.Link as={Link} to="/user-stats">Statystyki</Nav.Link>
            </>
          )}
        </Nav>
        <Nav className="ms-auto">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Nav.Link as={Link} to="/admin-panel">Panel Administratora</Nav.Link>
              )}
              <Nav.Link as={Link} to="/profile">Witaj, {user.email}</Nav.Link>
              <Nav.Link onClick={onLogout}>Wyloguj</Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/login">Zaloguj</Nav.Link>
              <Nav.Link as={Link} to="/register">Zarejestruj</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
