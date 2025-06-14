/*
  Arquivo: src/components/Mindmap/CustomNode.js
  Descrição: Adicionado 'e.stopPropagation()' nos eventos de clique dos tópicos para impedir a propagação do evento para o nó pai, corrigindo o conflito que impedia a abertura do menu de contexto.
*/
import React, { useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import './CustomNode.css';

const CustomNode = ({ id, data }) => {
  const { topics = [], updateNodeData, onDeleteNode, onShowContextMenu, nodeColor, fontColor } = data;
  const nodeRef = useRef(null);
  const toolbarRef = useRef(null);
  const [formatToolbar, setFormatToolbar] = React.useState(null);

  useEffect(() => {
    const topicToEdit = topics.find(t => t.isEditing);
    if (topicToEdit) {
      const topicIndex = topics.indexOf(topicToEdit);
      const topicElement = nodeRef.current?.querySelector(`[data-index='${topicIndex}']`);
      if (topicElement) {
        topicElement.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(topicElement);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [topics]);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (event.button !== 0) return;
        
        const isToolbarClick = toolbarRef.current && toolbarRef.current.contains(event.target);

        if (formatToolbar && !isToolbarClick) {
            const selection = window.getSelection();
            if(selection.isCollapsed) {
               setFormatToolbar(null);
            }
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [formatToolbar]);

  const addNewTopic = () => {
    const newTopics = [
      ...topics.map(t => ({...t, isEditing: false})), 
      { text: '', links: [], isEditing: true }
    ];
    updateNodeData(id, newTopics);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };
  
  const handleBlur = (e, index) => {
    const newText = e.currentTarget.innerHTML;
    const newTopics = topics.map((topic, i) => 
        i === index ? { ...topic, text: newText, isEditing: false } : topic
    );
    updateNodeData(id, newTopics);
  };
  
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if(nodeRef.current && nodeRef.current.contains(range.commonAncestorContainer)) {
            const rect = range.getBoundingClientRect();
            setFormatToolbar({
                top: rect.top - 40,
                left: rect.left + (rect.width / 2),
            });
            return;
        }
    }
    setTimeout(() => setFormatToolbar(null), 150);
  };

  const applyHighlight = (color) => {
    document.execCommand('backColor', false, color);
    const activeElement = document.activeElement;
    if (activeElement) {
        activeElement.blur();
    }
  };

  return (
    <>
      <div className="custom-node" ref={nodeRef} style={{ backgroundColor: nodeColor, color: fontColor }}>
        <Handle 
          type="target" 
          position={Position.Top} 
          id={`${id}-top`} 
          className="custom-handle" 
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id={`${id}-bottom`} 
          className="custom-handle" 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          id={`${id}-right`} 
          className="custom-handle" 
        />
        <Handle 
          type="source" 
          position={Position.Left} 
          id={`${id}-left`} 
          className="custom-handle" 
        />

        <div className="custom-node-header" style={{borderColor: fontColor ? `${fontColor}20` : '#e2e8f0'}}>
          {topics[0] && (
            <div
              data-index={0}
              contentEditable={topics[0].isEditing}
              suppressContentEditableWarning
              className={`node-title ${topics[0].isEditing ? 'editing' : ''}`}
              onKeyDown={handleKeyDown}
              onBlur={e => handleBlur(e, 0)}
              onMouseUp={handleMouseUp}
              onClick={e => {
                e.stopPropagation();
                onShowContextMenu(e, id, 0);
              }}
              dangerouslySetInnerHTML={{ __html: topics[0].text }}
            />
          )}
          <button onClick={() => onDeleteNode(id)} className="delete-node-button" title="Deletar Card" style={{ color: fontColor ? `${fontColor}80` : ''}}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="custom-node-body">
          {topics.slice(1).map((topic, index) => (
            <div
              key={index + 1}
              data-index={index + 1}
              contentEditable={topic.isEditing}
              suppressContentEditableWarning
              className={`node-topic ${topic.isEditing ? 'editing' : ''}`}
              onKeyDown={handleKeyDown}
              onBlur={e => handleBlur(e, index + 1)}
              onMouseUp={handleMouseUp}
              onClick={e => {
                e.stopPropagation();
                onShowContextMenu(e, id, index + 1);
              }}
              dangerouslySetInnerHTML={{ __html: topic.text }}
            />
          ))}
        </div>

        <div className="custom-node-footer">
          <button onClick={addNewTopic} className="add-topic-icon-button" style={{color: fontColor ? `${fontColor}b0` : ''}}>
            <span className="material-icons">add</span>
          </button>
        </div>
      </div>

      {formatToolbar && (
        <div 
          ref={toolbarRef}
          className="format-toolbar" 
          style={{ top: formatToolbar.top, left: formatToolbar.left, transform: 'translateX(-50%)' }}
        >
          <input 
            type="color" 
            defaultValue="#fff799"
            onChange={(e) => applyHighlight(e.target.value)}
            className="format-color-picker"
            title="Escolha a cor do destaque"
          />
        </div>
      )}
    </>
  );
};

export default React.memo(CustomNode);