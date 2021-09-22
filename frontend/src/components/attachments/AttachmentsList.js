import AttachmentItem from './AttachmentItem';
import React from 'react'
import css from './AttachmentsList.module.css';

const AttachmentsList = (props) => {
    return (
        <div className={css.container}>
            <AttachmentItem className={css.item} parentName={'Attachments'} attachments={props.attachments}/>
        </div>
    )
}

export default React.memo(AttachmentsList);
