import React, {useContext, useEffect, useState} from 'react';
import {Context} from "../index";
import {themeManager} from "../managers/themeManager";

const useThemeDetector = () => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const {localConfig} = useContext(Context)

    darkModeQuery.addEventListener('change', () => {
        if(localConfig.theme === 'system')
            themeManager(localConfig).setStyle()
    })
}

export default useThemeDetector