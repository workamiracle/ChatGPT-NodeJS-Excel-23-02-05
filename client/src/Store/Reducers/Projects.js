import { ADD_PROJECT,DELETE_PROJECT, ADD_TASK, DELETE_TASK, SELECT_PROJECT, RUNNING } from "../Actions/type";

const initialState = {
  projects: [],
  project: {
    index: -1,
    name: '',
    doc: '',
    tasks: []
  },
  isRunning: false
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

    case SELECT_PROJECT:
      return {
        ...state,
        project: {
          ...state.projects[payload.index], 
          index: payload.index
        }
      }

    case ADD_TASK:
      const { index, name, sheet, type } = payload;
      let newProjects = state.projects;
      newProjects[index].tasks.push({
        name,
        sheet,
        type
      });

      return {
        ...state,
        projects: newProjects
      }

    case DELETE_TASK:
      const { projectIndex, taskIndex } = payload;
      
      let newProjects1 = state.projects;
      newProjects1[projectIndex].tasks.splice(taskIndex, 1);

      return {
        ...state,
        projects: newProjects1
      }

    case RUNNING:
      return {
        ...state,
        isRunning: true
      }

    default:
      return state;
  }
}

export default projectReducer;