import { ADD_PROJECT, DELETE_PROJECT } from "./type";

export const addProject = (projectName, doc) => (dispatch) => {
  dispatch({
    type: ADD_PROJECT,
    payload: {
      name: projectName,
      doc: doc
    }
  });
}

export const deleteProject = (index) => (dispatch) => {
  dispatch({
    type: DELETE_PROJECT,
    payload: {
      index: index
    }
  });
}