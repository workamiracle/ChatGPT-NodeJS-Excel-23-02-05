import React from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './Store/store'
import Project from "./Components/Layout/Project";
import Task from "./Components/Layout/Task";
import CreateProject from "./Components/CreatePanel/Project";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Project />} />
          <Route exact path="/task" element={<Task />} />
          <Route exact path="/create_project" element={<CreateProject />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
