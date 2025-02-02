import { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authCheck } from '../http/userApi'
import { Context } from '../index'
import { epoch_courseData, epoch_fetchServerData } from '../http/epochServer'
import { themeManager } from '../managers/themeManager'
import {smoothTsManager} from "../managers/smoothTsManager";

const next = (id, end, courseData, localConfig) => {
	loadingCourses(id)
		.then(r => {
			console.log('courses: ', r.courses)
			// список заданий с бд
			courseData.setActiveCourse(r.serverData.active)
			courseData.setCourses(r.courses)
			loadingLocalConfig(localConfig)
			loadingTheme(localConfig)
			end()
		})
		.catch(err => console.log(err))
}

/* подгрузка активных курсов с бд + настроек */
const loadingCourses = async id =>
	new Promise((upperRes, upperRej) => {
		epoch_fetchServerData(id)
			.then(serverData => {
				console.log(serverData)
				Promise.all(
					serverData.active.map(i =>
						epoch_courseData(i.course_id, i.course_name)
					)
				).then(r => upperRes({ courses: r, serverData }))
			})
			.catch(err => upperRej(err))
	})

/* получение локальных конфигураций */
const loadingLocalConfig = localConfig => {
	const check = key => {
		let localKey = localStorage.getItem(key);
		if(localKey === null) return true; // default value
		return Boolean(Number(localStorage.getItem(key)));
	}


	localConfig.setSky({
		text: localConfig.sky.text,
		key: localConfig.sky.key,
		value: check(localConfig.sky.key),
	})

	localConfig.setMsg({
		text: localConfig.msg.text,
		key: localConfig.msg.key,
		value: check(localConfig.msg.key),
	})

	localConfig.setSmoothTs({
		text: localConfig.smoothTs.text,
		key: localConfig.smoothTs.key,
		value: check(localConfig.smoothTs.key),
	})
}

/*  */
const loadingTheme = localConfig => {
	themeManager(localConfig).setStore(null)
	themeManager(localConfig).setStyle()
}

const loadingSmoothTs = localConfig => {
	smoothTsManager(localConfig).setStore(null)

}

const navigateAfterBadTryLogin = (navigate, path) => {
	if (path !== '/login' || path !== '/credits') navigate('/home')
}

const useApp = () => {
	const { user, courseData, localConfig } = useContext(Context)

	const navigate = useNavigate()
	const location = useLocation()
	const [isLoading, setIsLoading] = useState(true)

	const mainPreloadingDate = () => {
		authCheck()
			.then(r => {
				console.log('authCheck: ', r)
				if (!user.isAuth) user.setIsAuth(true)
				user.setUserData(r.data.data.user)
				let id = r.data.data.user.anotherID
				console.log(id, r.data.data.user)
				/* загрузка курсов */
				next(id, () => setIsLoading(false), courseData, localConfig)
			})
			.catch(err => {
				if (err.response.status === 401) {
					// пользователь не авторизован
					if (user.isAuth) user.setIsAuth(false)
					navigateAfterBadTryLogin(navigate, location.pathname)
					setIsLoading(false)
				}
			})
	}

	useEffect(mainPreloadingDate, [])

	return { isLoading, isAuth: user.isAuth }
}

export default useApp
