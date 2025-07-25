@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600&family=Quicksand:wght@500;600;700&display=swap');

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Nunito', sans-serif;
  color: #333;
}

.header {
  margin-bottom: 2rem;
  text-align: center;

  .title {
    font-family: 'Quicksand', sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
    color: #81A04A;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 1.1rem;
    color: #5E3E23;
  }
}

.filtersContainer {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  justify-content: space-between;
}

.searchBar {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 500px;

  .searchInput {
    width: 100%;
    padding: 0.75rem 1.5rem;
    border: 1px solid #81A04A;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    color: #5E3E23;

    &:focus {
      outline: none;
      border-color: #80a04ad5;
      box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
    }
  }

  .searchIcon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    fill: #212121;
    pointer-events: none;
  }
}

.filterDropdown {
  position: relative;

  .dropdownButton {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    background-color: white;
    border: 1px solid #81A04A;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    min-width: 200px;
    color: #5E3E23;

    &:hover {
      border-color: #80a04ad5;
    }

    .dropdownIcon {
      margin-left: 0.5rem;
      color: #212121;
    }
  }

  .dropdownMenu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    border: 1px solid #81A04A;
    border-radius: 8px;
    margin-top: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
    max-height: 300px;
    overflow-y: auto;

    .dropdownItem {
      padding: 0.75rem 1.25rem;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #80a04a5f;
      }
    }
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 10px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }

  .cardHeader {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;

    .clientAvatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 0.75rem;
      border: 1.5px solid #3498db;
    }

    .avatarPlaceholder {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #3498db;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 0.75rem;
      font-family: 'Quicksand', sans-serif;
    }
  }

  .cardTitle {
    font-family: 'Quicksand', sans-serif;
    font-size: 1.2rem;
    font-weight: 600;
    color: #5E3E23;
    margin: 0;
    flex: 1;
  }

  .cardDescription {
    padding: 1rem;
    color: #5E3E23;
    font-size: 0.95rem;
    flex: 1;
  }

  .cardMeta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-top: 1px solid #eee;
    margin-top: auto;

    .locationContainer {
      display: flex;
      align-items: center;
      color: #7f8c8d;

      .locationIcon {
        margin-right: 0.5rem;
        fill: #ff2f2f;
      }
    }
  }

  .detailsButton {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #2980b9;
    }
  }
}

.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;

  .emptyIcon {
    fill: #3498db;
    margin-bottom: 1rem;
  }

  .emptyText {
    color: #5E3E23;
    font-size: 1.1rem;
  }
}

.loadingContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(52, 152, 219, 0.2);
    border-radius: 50%;
    border-top-color: #3498db;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 1rem;
  }

  .loadingText {
    color: #7f8c8d;
    font-size: 1.1rem;
  }
}

.errorContainer {
  padding: 2rem;
  text-align: center;

  .errorText {
    color: #e74c3c;
    font-size: 1.1rem;
  }
}

.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modalContent {
  background-color: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  position: relative;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.closeModalButton {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  fill: #212121;
  transition: color 0.2s ease;

  &:hover {
    fill: #e92020;
  }
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;

  .modalTitle {
    font-family: 'Quicksand', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    color: #81A04A;
    margin: 0;
  }

  .modalAvatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #3498db;
  }

  .modalAvatarPlaceholder {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #3498db;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-family: 'Quicksand', sans-serif;
  }
}

.modalBody {
  .modalSection {
    margin-bottom: 2rem;

    &:last-child {
      margin-bottom: 0;
    }

    .sectionTitle {
      font-family: 'Quicksand', sans-serif;
      font-size: 1.3rem;
      color: #5E3E23;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5rem;
    }

    .sectionContent {
      color: #5E3E23;
      line-height: 1.6;
    }
  }

  .imageGallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .modalImage {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
  }

  .contactInfo {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .contactName {
      font-weight: 600;
      color: #81A04A;
    }

    .contactEmail, .contactPhone {
      color: #3498db;
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: #2980b9;
        text-decoration: underline;
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .header {
    .title {
      font-size: 2rem;
    }
  }

  .filtersContainer {
    flex-direction: column;
    gap: 1rem;
  }

  .searchBar {
    width: 100%;
    margin-bottom: 1rem;

    .searchInput {
      padding: 0.75rem 2.5rem 0.75rem 1rem;
    }

    .searchIcon {
      right: 0.75rem;
    }
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .modalContent {
    padding: 1.5rem;
    max-width: 95%;
  }

  .modalHeader {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}






