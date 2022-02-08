import Modal from '@/components/modal'
import classNames from 'classnames'
import style from './style.module.css'
import { memo, useState, useCallback, useRef, forwardRef, useImperativeHandle, FC } from 'react'

interface Props {
    ref?: any
    isCreate?: boolean
    onConfirm?: (title: string) => void
    onDelete?: () => void
    onSelectDir?: (title: string) => void
}

export interface EditModalIns {
    show: (title: string) => void
    close: () => void
    reset: () => void
}

// 键盘 code
const keyCode = {
    enter: 13
}

const EditModal: FC<Props> = memo(forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const inputRef = useRef<any>()
    const cacheRef = useRef<{ curLayer: string }>({
        curLayer: ''
    })

    // 设置 input value
    const setInputValue = useCallback((val: string) => {
        if (inputRef.current) {
            inputRef.current.value = val
        }
    }, [])

    // 关闭弹窗
    const closeModal = useCallback(() => {
        setVisible(false)
    }, [])

    // 更新图层
    const onUpdateLayer = useCallback(() => {
        const title = inputRef.current.value as string
        if (!title) {
            return setErrorMsg('value can not empty!')
        }
        props.onConfirm && props.onConfirm(title)
        setVisible(false)
        setErrorMsg('')
        setInputValue('')
    }, [props, setInputValue])

    // 选择文件夹
    const onSelectDir = useCallback(() => {
        const title = inputRef.current.value as string
        props.onSelectDir && props.onSelectDir(title)
        setErrorMsg('')
    }, [props])

    // 删除图层
    const onDeleteLayer = useCallback(() => {
        props.onDelete && props.onDelete()
        setVisible(false)
        setErrorMsg('')
        setInputValue('')
    }, [props, setInputValue])

    // 键盘弹起
    const onInputKeyup = useCallback((e) => {
        if (e.keyCode === keyCode.enter) {
            onUpdateLayer()
        }
    }, [onUpdateLayer])

    useImperativeHandle(ref, () => {
        return {
            show(title: string) {
                setVisible(true)
                setInputValue(title)
            },
            close() {
                setVisible(false)
            },
            reset() {
                setErrorMsg('')
                setInputValue('')
            }
        }
    }, [setInputValue])

    return (
        <Modal
            onClose={closeModal}
            visible={visible}>
            <div className={style.modal}>
                <h2 className={style.title}>Setting</h2>
                <input
                    ref={inputRef}
                    type="text"
                    defaultValue={cacheRef.current.curLayer}
                    placeholder="placeholder"
                    className={style.inputEl}
                    onKeyUp={onInputKeyup}
                />
                { !!errorMsg && (
                    <span className={style.errorMsg}>{ errorMsg }</span>
                ) }
                <div className={style.footer}>
                    <div
                        onClick={onUpdateLayer}
                        className={classNames(style.confirm, style.button)}>
                        Confirm
                    </div>
                    {props.isCreate ? (
                        <div
                            onClick={onSelectDir}
                            className={classNames(style.confirm, style.button)}>
                            Directority
                        </div>
                    ) : null}
                    {props.isCreate ? null : (
                        <div onClick={onDeleteLayer}
                            className={classNames(style.delete, style.button)}>
                            Delete
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    )
}))

export default EditModal
