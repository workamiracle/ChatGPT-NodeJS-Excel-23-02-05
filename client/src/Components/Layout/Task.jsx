import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { deleteTask } from '../../Store/Actions/Task';

const Task = ({project, deleteTask}) => {
  const navigate = useNavigate();

  const TaskTable = (
    <table className="table table-info table-striped mt-4">
      <thead>
        <tr className="table-primary">
          <th>Task Name</th>
          <th>Type</th>
          <th>Action</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {project.tasks.map((task, index) => (
          <tr key={index}>
            <td>{task.name} ({task.sheet})</td>
            <td>{task.type}</td>
            <td>
              <button className="btn btn-success btn-sm">Run</button>
            </td>
            <td>
              <button className="btn btn-info btn-sm">Rename</button>
            </td>
            <td>
              <button className="btn btn-danger btn-sm" onClick={() => {deleteTask(project.index, index); navigate('/task')}}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <div className="container">
        
        <div className="Task-panel mt-5 p-5" style={{borderRadius: '3px', border: '1px solid #333'}}>
          <h2>{project.name}</h2>

          <button className="btn btn-primary btn-lg" style={{float: 'right'}}>Run Project</button>

          <Link to={"/create_task"}>
            <button className="btn btn-primary btn-lg mt-3">+ Create Task</button>
          </Link>          

          {TaskTable}
        </div>
      </div>
    </div>
  );
};

Task.propTypes = {
  project: PropTypes.object,
  deleteTask: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  project: state.projects.project
});

export default connect(mapStateToProps, { deleteTask })(Task);