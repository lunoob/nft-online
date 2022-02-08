import { memo, FC, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useUpdateEffect, useMount } from 'ahooks'
import style from './style.module.css'
import classNames from 'classnames'

interface Props {
    visible?: boolean
    onClose?: () => void
}

const IModal: FC<Props> = memo((props) => {
    const [isRender, setIsRender] = useState(false)

    const closeModal = useCallback(() => {
        props.onClose && props.onClose()
    }, [props])

    useUpdateEffect(() => {
        if (props.visible) {
            setIsRender(true)
        }
    }, [props.visible])

    useMount(() => {
        if (props.visible) {
            setIsRender(true)
        }
    })

    if (!isRender) {
        return <></>
    }

    const modalNode = (
        <div style={{ display: props.visible ? 'block' : 'none' }}>
            <div className={style.mask} onClick={closeModal}></div>
            <div className={classNames(style.lineModal, style.slideInDown)}>
                <i
                    className={classNames(
                        'iconfont icon-shanchu',
                        style.closeIcon
                    )}
                    onClick={closeModal}>
                </i>
                { props.children }
            </div>
        </div>
    )

    return createPortal(modalNode, document.body)
})

export default IModal
