import axios from "axios";

import { ADD_TASK, DELETE_TASK } from "./type";



export const addTask = (index, name, sheet, type) => (dispatch) => {
  dispatch({
    type: ADD_TASK,
    payload: {
      index,
      name,
      sheet,
      type
    }
  });
}

export const deleteTask = (projectIndex, taskIndex) => (dispatch) => {
  dispatch({
    type: DELETE_TASK,
    payload: {
      projectIndex,
      taskIndex
    }
  });
}

export const runTask = (doc, sheet, type) => async (dispatch) => {
  const res = await axios.post('/run/task', {
    doc,
    sheet,
    type
  });
}

export const runProject = (tasks) => async (dispatch) => {
  const res = await axios.post('/run/project', {
    tasks
  });
}
