import {$authHost} from "./index";
import {API_ALL_COURSES, API_COURSE, API_DELETE_FILE, API_DUTY, API_UPLOAD_FILE} from "./consts";
import axios from "axios";
import {preEpoch_mergeCourseData} from "./preEpoch";


const conv = data => {
    let conv_data = {...data}
    if (!conv_data.active)
        conv_data.active = []
    if (typeof conv_data.active === 'string')
        conv_data.active = JSON.parse(conv_data.active)

    if (!conv_data.settings)
        conv_data.settings = {}
    if (typeof conv_data.settings === 'string')
        conv_data.settings = JSON.parse(conv_data.settings)

    return conv_data
}


/* Загрузка всех курсов со студа */
const fetchAllCourses = async (id) => new Promise((resolve, reject) => {
    $authHost(API_ALL_COURSES)
        .then(d =>
            resolve(d.data.data.listCourse.reverse()
                .map(i => ({course_id: i.courseID, course_name: i.discipline}))))
        .catch(err => reject(err))
})

const serverKey = 'AKfycbwhPuNg2tS8t_vxveG0L_0W737SC5G47J6j9ctIGTa1dv3wQHobnfpnbxTdBxVUWa0H0g'
const serverUrl = `https://script.google.com/macros/s/${serverKey}/exec?`


const serverInter = axios.create({
        baseURL: serverUrl
    },
    {
        crossDomain: true,
        redirect: true,
        contextType: "text/plain",
        method: "POST",
        dataType: "jsonp"
    })


/* подгрузка данных с бд */
export const epoch_fetchServerData = async (id) => new Promise((resolve, reject) => {
    let body = JSON.stringify({id, type: "get"})
    serverInter.post('', body)
        .then(d => resolve(conv(d.data.data)))
        .catch(err => reject(err))
})

/* данные курса */
export const epoch_courseData = (course_id, course_name = '') => new Promise((resolve, reject) => {
    // кусок данных об курсе
    const user_data = new Promise((resolve, reject) =>
        $authHost(API_COURSE + course_id)
            .then(d => resolve(d.data.data))
    )
    // еще один кусок данных об курсе
    const duty_data = new Promise((resolve, reject) =>
        $authHost(API_DUTY + course_id)
            .then(d => resolve(d.data.data))
    )
    // получаем полную инфу
    Promise.all([user_data, duty_data])
        .then(p => {
            resolve(preEpoch_mergeCourseData(p[0], p[1], course_id, course_name))
        })
})


/* Отправка файла */
export const epoch_uploadFile = (formData) => new Promise((resolve, reject) => {
    $authHost.post(API_UPLOAD_FILE, formData)
        .then(d => {
            resolve(d.data)
        })
        .catch(e => reject(e))
})

/* Удаление файла */
export const epoch_deleteFile = (fileID) => new Promise((resolve, reject) => {
    $authHost.delete(API_DELETE_FILE + fileID)
        .then(d => resolve(d.data))
        .catch(e => e)
})

