import React, {Fragment, useState} from 'react';
import {Button} from '@material-ui/core';
import {KeyboardArrowDown, KeyboardArrowRight} from '@material-ui/icons';

const buttonStyle = {
    textTransform: 'none',
    justifyContent: 'flex-start',
    textAlign: 'left'
}

const AttachmentItem = (props) => {
    const [open, setOpen] = useState(false);
    const items = []
    const toParents = []
    props.attachments.forEach(attachment => {
        const newAttachment = Object.assign({}, attachment);
        const attachmentName = newAttachment.name;
        if (attachmentName.includes('/')) {
            newAttachment.parentName = attachmentName.slice(0, attachmentName.indexOf('/'));
            newAttachment.name = attachmentName.slice(attachmentName.indexOf('/') + 1);
            toParents.push(newAttachment);
        } else {
            items.push(newAttachment)
        }
    })
    const parents = {}
    toParents.forEach(toParent => {
        if (Object.keys(parents).includes(toParent.parentName)) {
            parents[toParent.parentName].push(toParent);
        } else {
            parents[toParent.parentName] = [toParent]
        }
    })
    const onToggle = () => {
        setOpen(!open)
    }
    const onOpen = (attachment) => {
        window.open(`${window.location.protocol}//${window.location.host}/files/get?name=${attachment.source}`, '_blank')
    }
    return (
        <Fragment>
            <Button startIcon={open ? <KeyboardArrowDown/> : <KeyboardArrowRight/>}
                    fullWidth={true}
                    style={props.parentName === 'Attachments' ? {fontWeight: 'bold'} : buttonStyle}
                    onClick={onToggle}>{props.parentName}</Button>
            {open && <ul>
                {Object.keys(parents).map(parentName => <AttachmentItem key={parentName} parentName={parentName} attachments={parents[parentName]}/>)}
                {Object.values(items).map(item => <Button onClick={() => onOpen(item)} style={buttonStyle} fullWidth={true}
                                                          key={item.attachment_id}>{item.name}</Button>)}
            </ul>}
        </Fragment>
    )
}

export default React.memo(AttachmentItem);
