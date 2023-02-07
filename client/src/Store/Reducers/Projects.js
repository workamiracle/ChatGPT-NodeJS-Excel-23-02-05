import { ADD_PROJECT,DELETE_PROJECT, ADD_TASK } from "../Actions/type";

const initialState = {
  projects: [],
  project: {}
}

function projectReducer(state = initialState, action) {
  const { type, payload } = action;

  switch(type) {
    case ADD_PROJECT:
      return {
        ...state,
        projects: [...state.projects, payload]
      };

    case DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter((project, index) => index !== payload.index)
      }

    default:
      return state;
  }
}

export default projectReducer;