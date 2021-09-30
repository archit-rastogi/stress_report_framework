import AttachmentItem from './AttachmentItem';
import React from 'react'
import css from './AttachmentsList.module.css';

const AttachmentsList = (props) => {
    return (
        <div className={css.container}>
            <AttachmentItem parentName={'Attachments'} attachments={props.attachments}/>
        </div>
    )
}

export default React.memo(AttachmentsList);
