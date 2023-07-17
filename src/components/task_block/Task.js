import {
    Clock,
    CaretLeft,
    PencilSimple,
    FileZip,
    DownloadSimple,
    GraduationCap,
    CalendarBlank,
    ChatCircle,
    Plus,
    Trash
} from "@phosphor-icons/react";

import {NavLink, useNavigate} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import Materials from "../materials/Materials";
import AddSolutionModal from "./AddSolutionModal";
import {preEpoch_getCurrentTaskData, preEpoch_getDetailTaskData} from "../../http/preEpoch";
import {Context} from "../../index";
import TaskFile from "./TaskFile";
import TaskInfo from "./TaskInfo";
import Solution from "./Solution";

const Task = () => {
    const {courseData} = useContext(Context)
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(true)
    const [currentData, setCurrentData] = useState({})
    const [detailData, setDetailData] = useState({})
    const [materialsData, setMaterialsData] = useState([])
    /* Параметры, отправляемые вместе с файлом */
    const [parameters, setParameters] = useState({})

    const findMaterials = (course_id) => {
        // console.log('findMaterials -> course_id: ', course_id)
        // console.log('findMaterials -> courses', courseData.courses)
        for (let c of courseData.courses)
            if (course_id === c.course_id)
                return c.courseMaterials
    }

    /* Загружает/обновляет все денные о задании */
    const loadingTaskData = () => {
        let taskId = Number(localStorage.getItem('taskId'))
        if (!taskId) navigate('/')

        //
        let curD = preEpoch_getCurrentTaskData(taskId, courseData.courses)
        setCurrentData(curD)
        // получаем материалы курса
        setMaterialsData(findMaterials(curD.courseID))
        // ждем дополнительные данные от сервера
        preEpoch_getDetailTaskData(taskId)
            .then(d => {
                // загрузка метериалов

                // загрузка детальной инфы
                setDetailData(d)
                // загрузка параметров для прикрепления файлов
                setParameters({
                    studentID: d.studentID,
                    courseTaskID: d.courseTaskID,
                    courseStudentID: d.courseStudentID,
                })
                // конец загрузки
                setIsLoading(false)
            }).catch(err => console.log(err))
        return () => setIsLoading(true)
    }

    useEffect(loadingTaskData, [localStorage.getItem('taskId')])

    if (isLoading) return <div className="block"/>
    console.log('currentData: ', currentData)
    console.log('detailData: ', detailData)

    const back = () => {
        // console.log('back:', )
        navigate(-1)
    }


    // >xd<
    // Task
    // ----TaskInfo
    // ----Solution
    // --------SolutionFile
    // --------SolutionModal
    // ------------Dropzone
    // ------------MobileDropzone
    // ----Materials
    // >xd<

    return (
        <div className="block">

            {/* Название + back()*/}
            <div className="title_container back_container" onClick={back}>
                <CaretLeft weight="bold" className="icon_mid"/>
                <h2>{currentData.nameTask}</h2>
            </div>

            {/*файл задания*/}
            {currentData.taskFile && <TaskFile taskFile={currentData.taskFile}/>}

            {/* информация о задании */}
            <TaskInfo
                status={currentData.statusName}
                teacher={currentData.userFIO}
                dateAdded={currentData.dateAdded}
                periodRealization={currentData.periodRealization}
                statusID={currentData.statusID}
                notation={detailData?.notation}
            />

            {/* Блок с решением задания (прикрепление + уже прикрепленные файлы)*/}
            <Solution
                files={detailData?.files.sort((a, b) => a.dateLoading < b.dateLoading)}
                isSuccess={currentData.statusID === 4}
                parameters={parameters}
                loadingTaskData={loadingTaskData}
            />

            {materialsData && <Materials items={materialsData}/>}

        </div>
    );
}

export default Task;