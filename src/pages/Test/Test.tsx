import { useState } from 'react';
import Tasks from "./components/Tasks";
import ImageUpload from "./components/ImageUpload";
import WebSocketTest from "./components/WebSocket";

type TabType = 'tasks' | 'upload' | 'websocket';

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'tasks', label: 'Tareas' },
    { id: 'upload', label: 'Subida de Imágenes' },
    { id: 'websocket', label: 'WebSocket' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <div className="p-4 card bg-base-100 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Gestión de Tareas</h2>
            <Tasks />
          </div>
        );
      case 'upload':
        return (
          <div className="p-4 card bg-base-100 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Subida de Imágenes</h2>
            <ImageUpload />
          </div>
        );
      case 'websocket':
        return (
          <div className="p-4 card bg-base-100 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Prueba de WebSocket</h2>
            <WebSocketTest />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Página de Pruebas</h1>
      
      <div className="tabs tabs-boxed bg-base-200 p-1 rounded-lg mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'tab-active bg-base-100' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}
