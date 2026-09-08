/**
 * code.js — ASD Judo Bagno a Ripoli
 * Logica condivisa: Gestione del menu laterale (Drawer) e Dark Mode con persistenza in localStorage.
 */

(function () {
  'use strict';

  /**
   * Applica o rimuove il tema scuro (data-theme="dark") su <html>
   * @param {string} theme - 'dark' oppure 'light'
   */
  function setTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
    updateToggleUI(theme);
  }

  /**
   * Sincronizza lo stato dell'interruttore e delle etichette con il tema corrente
   * @param {string} theme - 'dark' oppure 'light'
   */
  function updateToggleUI(theme) {
    const toggle = document.getElementById('darkThemeSwitch');
    const statusLabel = document.getElementById('themeStatusLabel');
    const isDark = theme === 'dark';

    if (toggle) {
      toggle.checked = isDark;
    }
    if (statusLabel) {
      statusLabel.textContent = isDark ? 'Attivata (Tema Scuro)' : 'Disattivata (Tema Chiaro)';
    }
  }

  /**
   * Apre il menu laterale a scomparsa
   */
  function openDrawer() {
    const drawer = document.getElementById('sideDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const toggleBtn = document.getElementById('menuToggle');

    if (drawer && overlay) {
      drawer.classList.add('side-drawer--open');
      overlay.classList.add('drawer-overlay--open');
      drawer.setAttribute('aria-hidden', 'false');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('drawer-scroll-locked');
    }
  }

  /**
   * Chiude il menu laterale a scomparsa
   */
  function closeDrawer() {
    const drawer = document.getElementById('sideDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const toggleBtn = document.getElementById('menuToggle');

    if (drawer && overlay) {
      drawer.classList.remove('side-drawer--open');
      overlay.classList.remove('drawer-overlay--open');
      drawer.setAttribute('aria-hidden', 'true');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('drawer-scroll-locked');
    }
  }

  // Inizializzazione al caricamento del DOM
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Recupera il tema salvato o default a light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // 2. Elementi interattivi
    const menuToggle = document.getElementById('menuToggle');
    const drawerClose = document.getElementById('drawerClose');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const darkThemeSwitch = document.getElementById('darkThemeSwitch');

    if (menuToggle) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        openDrawer();
      });
    }

    if (drawerClose) {
      drawerClose.addEventListener('click', closeDrawer);
    }

    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', closeDrawer);
    }

    // Chiusura premendo il tasto ESC sulla tastiera
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeDrawer();
      }
    });

    // Cambio tema all'azionamento dell'interruttore
    if (darkThemeSwitch) {
      darkThemeSwitch.addEventListener('change', (e) => {
        setTheme(e.target.checked ? 'dark' : 'light');
      });
    }
  });
})();
