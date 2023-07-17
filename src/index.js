import React, {createContext} from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from 'react-router-dom';
import UserStore from "./store/userStore";
import CourseStore from "./store/courseStore";

export const Context = createContext(null)


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Context.Provider value={{
            user: new UserStore(),
            courseData: new CourseStore()
        }}>
            <App/>
        </Context.Provider>
    </BrowserRouter>
);

reportWebVitals();
