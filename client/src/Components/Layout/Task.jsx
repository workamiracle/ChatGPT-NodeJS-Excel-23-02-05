import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const Task = ({projects}) => {
  const ProjectTable = (
    <table className="table table-info table-striped mt-4">
      <thead>
        <tr className="table-primary">
          <th>Porject Name</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project, index) => (
          <tr key={index}>
            <td>{project.name} ({project.doc})</td>
            <td>
              <button className="btn btn-info btn-sm">Rename</button>
            </td>
            <td>
              <button className="btn btn-danger btn-sm">Delete</button>
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
          <h2>Project 1</h2>

          <button className="btn btn-primary btn-lg" style={{float: 'right'}}>Run Project</button>

          <button className="btn btn-primary btn-lg mt-3">+ Create Task</button>

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
              <tr>
                <td>Task 1 (Worksheet)</td>
                <td>Fixed</td>
                <td>
                  <button className="btn btn-success btn-sm">Run</button>
                </td>
                <td>
                  <button className="btn btn-info btn-sm">Rename</button>
                </td>
                <td>
                  <button className="btn btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

Task.propTypes = {
  projects: PropTypes.array.isRequired
}

const mapStateToProps = (state) => ({
  projects: state.projects.projects
});

export default connect(mapStateToProps)(Task);