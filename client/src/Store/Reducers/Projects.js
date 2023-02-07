import { ADD_PROJECT, ADD_TASK } from "../Actions/type";

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
        projects: [...state.projects, payload.project],
        project: payload.project
      };
  }
}

export default projectReducer;