import React from 'react';
import { useDispatch } from 'react-redux';

const CreateProject = () => {
  const dispatch = useDispatch();

  const onSaveProject = (e) => {
    e.preventDefault();
  }

  return (
    <div className='container'>
      <div className='form mt-5' onSubmit={onSaveProject}>
        <h1 className='text-center'>Create Project</h1>

        <p className='lead'>Google Doc Name:</p>
        <input type="text" name='googledoc' />
        <br />
        <button type='submit' className='btn btn-md btn-success mt-3'>Save</button>
      </div>
    </div>
  );
}

export default CreateProject;