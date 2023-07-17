import React from 'react';
import {ArrowSquareOut, FileImage} from "@phosphor-icons/react";
import {assignorIcon, assignorIconDownload, handleDownload} from "../../managers/files_manager";

const Material = ({item, isBreaker}) => {
    return (
        <>
            <div className="content_elem_row select" onClick={() => handleDownload(item.nameFile, item?.link)}>
                {assignorIcon(item.nameFile)}
                <p className="text_file">{item.nameFile ? item.nameFile: item?.nameLink}</p>
                {assignorIconDownload(item.nameFile)}
            </div>

            {isBreaker && <div className="breaker"></div>}
        </>
    );
};

export default Material;