/*
  Arquivo: src/components/Modal.js
  Descrição: Componente genérico para a criação de modais. Recebe o estado de visibilidade, um título e uma função para fechar. O conteúdo do modal é passado como `children`, tornando-o flexível para diversos usos.
*/
import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;