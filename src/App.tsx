import { useState, useRef, useCallback } from 'react'
import { remove, uniqueId } from 'lodash'
import { useMount, useUpdateEffect } from 'ahooks'
import { ReactSortable } from "react-sortablejs"
import EditModal, { EditModalIns } from '@/components/edit_modal'
import classNames from 'classnames'
import style from './App.module.css'

interface CacheRef {
    ctx: any,
    curLayer: string
}
interface Layer {
    id: number | string
    title: string
    images: {
        name: string
        src: any
        id: string
    }[]
}

const defaultSize = 350

// 创建自增 id
const increaseId = () => {
    let idx = 0
    return () => {
        idx += 1
        return idx
    }
}

const createId = increaseId()

function App() {
    const [isCreate, setIsCreate] = useState(false)
    const [layers, setLayers] = useState<Layer[]>([])
    const [activeMap, setActiveMap] = useState<any>({})
    const [canvasSize, setCanvasSize] = useState<number>(defaultSize)
    const editModalRef = useRef<EditModalIns>()
    const fileInputRef = useRef<any>()
    const dirFileInputRef = useRef<any>()
    const sizeInputRef = useRef<any>()
    const cacheRef = useRef<CacheRef>({
        ctx: null,
        curLayer: ''
    })

    // 渲染图层
    const renderLayers = useCallback(() => {
        const ctx = cacheRef.current.ctx as CanvasRenderingContext2D
        const drawLayerSelectors: string[] = []
        const layerSource: any[] = []

        layers.forEach((layer) => {
            const image = layer.images.find(image => image.name === activeMap[layer.id])
            if (image != null) {
                drawLayerSelectors.push(image.id)
                layerSource.push(document.getElementById(image.id))
            }
        })

        ctx.fillStyle = '#fff'
        ctx.fillRect(
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height
        )

        layerSource.forEach((imageSource) => {
            if (imageSource) {
                const draw = () => {
                    ctx.drawImage(
                        imageSource,
                        0,
                        0,
                        ctx.canvas.width,
                        ctx.canvas.height,
                    )
                }
                // 未加载完毕
                if (!imageSource.complete) {
                    imageSource.onload = () => {
                        draw()
                    }
                } else {
                    draw()
                }
            }
        })
    }, [activeMap, layers])

    // 增加图层图片
    const onAddLayerImage = useCallback((layer: string) => {
        cacheRef.current.curLayer = layer
        fileInputRef.current.click()
    }, [])

    // 图层设置
    const onLayerSetting = useCallback((layer: string) => {
        cacheRef.current.curLayer = layer || ''
        editModalRef.current?.show(layer || '')
    }, [])

    // 创建图层
    const createLayer = useCallback((title: string) => {
        return {
            id: uniqueId(`${+new Date()}`),
            title,
            images: []
        }
    }, [])

    // 设置默认 active item
    const setActiveItem = useCallback((layer) => {
        // 如果是初次选择
        // 默认第一张
        // 如果不是初次选择
        // 使用之前选中的 active 即可
        if (activeMap[layer.id] == null) {
            const simpleActiveMap = { ...activeMap }
            simpleActiveMap[layer.id] = layer.images[0].name
            setActiveMap(simpleActiveMap)
        }
    }, [activeMap])

    // 重置 active item
    const resetActiveItem = useCallback((layer, name) => {
        // 删除图片之后
        // 判断删除的是否当前激活的元素
        // 如果是则，恢复第一张
        if (activeMap[layer.id] !== name) {
            return
        }

        const simpleActiveMap = { ...activeMap }

        simpleActiveMap[layer.id] = layer.images.length ? layer.images[0].name : null

        setActiveMap(simpleActiveMap)
    }, [activeMap])

    // 更新 active item
    const updateActiveMap = useCallback((layerId, name) => {
        const simpleActiveMap = { ...activeMap }
        simpleActiveMap[layerId] = name
        setActiveMap(simpleActiveMap)
    }, [activeMap])

    // 删除图片
    const onDeleteImage = useCallback((layerId: any, imgName: string) => {
        const simpleCloneLayers = [...layers]
        const layer = simpleCloneLayers.find(n => n.id === layerId)
        if (layer != null) {
            remove(layer.images, (n) => {
                return n.name === imgName
            })
        }
        setLayers(simpleCloneLayers)
        resetActiveItem(layer, imgName)
    }, [layers, resetActiveItem])

    // 派发点击事件
    const emitClickEvent = useCallback((event: any) => {
        const type = event.target.dataset.type
        const layer = event.target.dataset.layer
        if (type == null) {
            return
        }
        if (type === 'add') {
            return onAddLayerImage(layer)
        }
        if (type === 'setting') {
            return onLayerSetting(layer)
        }
        if (type === 'create') {
            setIsCreate(true)
            return editModalRef.current?.show('')
        }
        if (type === 'delete') {
            const [layerId, name] = event.target.dataset.name.split('-')
            return onDeleteImage(layerId, name)
        }
        if (type === 'active') {
            const [layerId, name] = event.target.dataset.name.split('-')
            return updateActiveMap(layerId, name)
        }
    }, [onAddLayerImage, onLayerSetting, onDeleteImage, updateActiveMap])

    // 打开文件夹
    const onOpenDir = useCallback((title: string) => {
        cacheRef.current.curLayer = title
        dirFileInputRef.current.click()
    }, [])

    // 更新图层信息
    const onUpdateLayer = useCallback((title: string) => {
        let simpleCloneLayers = [...layers]
        if (isCreate) {

            simpleCloneLayers.push(createLayer(title))
            setIsCreate(false)
        } else {

            const item = simpleCloneLayers.find(n => n.title === cacheRef.current.curLayer)
            if (item != null && item.id) {
                item.title = title
            }
        }
        setLayers(simpleCloneLayers)
    }, [layers, isCreate, createLayer])

    // 删除图层信息
    const onDeleteLayer = useCallback(() => {
        const simpleClone = [...layers]
        const item = simpleClone.find(n => n.title === cacheRef.current.curLayer)
        if (item) {
            simpleClone.splice(simpleClone.indexOf(item), 1)
        }
        setLayers(simpleClone)
        renderLayers()
    }, [layers, renderLayers])

    // 重置 input file value
    const resetFileInput = useCallback(() => {
        fileInputRef.current.value = ''
        dirFileInputRef.current.value = ''
    }, [])

    // 文件更改
    const onFileChange = useCallback(async (event: any) => {
        const isDir = (event.target as HTMLElement).getAttribute('directory') != null

        const files: any[] = Array.from(event.target.files).filter((n: any) => {
            const extname = (n.name as string).slice(-4)
            return extname === '.png'
        })

        if (!files) {
            return
        }

        const simpleCloneLayers = [...layers]
        let item: any = null

        if (isDir) {
            const defaultTitle = cacheRef.current.curLayer || `untitled-${createId()}`
            item = createLayer(defaultTitle)
            simpleCloneLayers.push(item)
            cacheRef.current.curLayer = defaultTitle
        } else {
            item = simpleCloneLayers.find(n => n.title === cacheRef.current.curLayer)
        }

        if (item != null) {
            for (const file of files) {
                const fileReader = new FileReader()
                fileReader.readAsDataURL(file)
                await new Promise((resolve) => {
                    fileReader.onload = (e: any) => {
                        const source = {
                            name: file.name,
                            src: e.target.result,
                            id: `${item.id}-${uniqueId()}`
                        }
                        item.images.push(source)
                        resolve(source.id)
                    }
                })
            }
        }
        setLayers(simpleCloneLayers)
        setActiveItem(item)
        resetFileInput()

        if (isDir) {
            setIsCreate(false)
            editModalRef.current?.close()
            editModalRef.current?.reset()
        }
        cacheRef.current.curLayer = ''
    }, [resetFileInput, layers, setActiveItem, createLayer])

    // 结束拖拽
    const onDragEnd = useCallback(() => {
        renderLayers()
    }, [renderLayers])

    // 设置 canvas 大小
    const onChangeCanvasSize = useCallback((type: 'reset' | 'set' ) => {
        return () => {
            if (type === 'reset') {
                setCanvasSize(defaultSize)
                sizeInputRef.current.value = defaultSize
            } else {
                const sizeInput = sizeInputRef.current.value as string
                if (sizeInput.trim()) {
                    setCanvasSize(+sizeInput.trim().replace('px', ''))
                }
            }
        }
    }, [])

    useMount(() => {
        const canvas = document.getElementById('nft-board') as any
        cacheRef.current.ctx = canvas!.getContext('2d')

        // 设置 dirFileInput attribute
        ;(dirFileInputRef.current as HTMLElement).setAttribute('webkitdirectory', '')
        ;(dirFileInputRef.current as HTMLElement).setAttribute('directory', '')
    })

    useUpdateEffect(() => {
        renderLayers()
    }, [activeMap, canvasSize])

	return (
        <div className={style.App}>
            <div className={style.layers} onClick={emitClickEvent}>
                <ReactSortable
                    list={layers}
                    setList={setLayers}
                    animation={150}
                    onEnd={onDragEnd}
                    className={style.dragArea}
                    handle=".layer-title">
                    {layers.map((layer: any) => (
                        <div className={style.layerItem} key={layer.id}>
                            <h2 className={classNames(style.layerTitle, 'layer-title')}>
                                <span className={style.titleValue}>{ layer.title }</span>
                                <i
                                    data-type="setting"
                                    data-layer={layer.title}
                                    className={classNames(
                                        'iconfont icon-shezhi',
                                        style.layerTitleIcon)
                                    }>
                                </i>
                            </h2>
                            <div className={style.layerList}>
                                <ul className={style.layerSources}>
                                    {layer.images.map((image: any) => (
                                        <li
                                            className={classNames(
                                                style.sourceItem,
                                                {
                                                    [style.active]: activeMap[layer.id] === image.name
                                                }
                                            )}
                                            key={image.id}>
                                            <i
                                                data-type="delete"
                                                data-name={`${layer.id}-${image.name}`}
                                                className={classNames('iconfont icon-shanchu', style.deleteIcon)}>
                                            </i>
                                            <img
                                                src={image.src}
                                                alt="background"
                                                id={image.id}
                                                data-type="active"
                                                data-name={`${layer.id}-${image.name}`}
                                            />
                                        </li>
                                    ))}
                                </ul>
                                <div className={style.addNew} data-type="add" data-layer={layer.title}>Add</div>
                            </div>
                        </div>
                    ))}
                </ReactSortable>
                <div className={classNames(style.layerItem, style.addLayer)}>
                    <div className={style.addLayerButton} data-type="create">Add Layer</div>
                </div>
            </div>
            <div className={style.updateSize}>
                <div className={style.width}>
                    <label htmlFor="size">size:</label>
                    <input
                        ref={sizeInputRef}
                        type="text"
                        id="size"
                        defaultValue={canvasSize}
                    />
                </div>
                <div className={style.button} onClick={onChangeCanvasSize('set')}>set</div>
                <div className={style.button} onClick={onChangeCanvasSize('reset')}>reset</div>
            </div>
            <div className={style.view}>
                <canvas
                    id="nft-board"
                    height={`${canvasSize}px`}
                    width={`${canvasSize}px`}
                    className={style.drawBoard}>
                </canvas>
            </div>
            <EditModal
                ref={editModalRef}
                isCreate={isCreate}
                onConfirm={onUpdateLayer}
                onDelete={onDeleteLayer}
                onSelectDir={onOpenDir}
            />
            <input
                type="file"
                multiple
                accept='image/png'
                className={style.fileInput}
                ref={fileInputRef}
                onChange={onFileChange}
            />
            <input
                type="file"
                accept='image/png'
                className={style.fileInput}
                ref={dirFileInputRef}
                onChange={onFileChange}
            />
        </div>
    )
}

export default App
