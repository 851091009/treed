
var React = require('react/addons')
  , cx = React.addons.classSet
  , PT = React.PropTypes
  , classnames = require('classnames')
  , DefaultEditor = require('../../views/body/default-editor')
  , DefaultRenderer = require('../../views/body/default-renderer')
  , Uploader = require('./uploader')
  , getSrc = require('./get-src')

var ImageBase = React.createClass({
  propType: {
    title: PT.string,
    onUpload: PT.func,
    onClick: PT.func,
  },

  getInitialState() {
    return {dragging: false}
  },

  _dragOver(e) {
    e.preventDefault()
    if (!this.state.dragging) {
      this.setState({dragging: true})
    }
  },

  _dragEnd(e) {
    e.preventDefault()
    this.setState({dragging: false})
  },

  _drop(e) {
    e.preventDefault()
    this.setState({dragging: false})
    let files = e.dataTransfer.files
    if (!files.length) return
    const file = files[0]
    if (!file.type.match(/^image\//)) {
      return console.warn('not an image file')
    }
    getSrc(file, this.props.onUpload)
  },

  render: function () {
    if (!this.props.src) {
      return <div
          className={classnames('ImageBase', this.state.dragging && 'ImageBase-dragging')}
          onClick={this.props.onClick} 
          onDragEnter={this._dragOver}
          onDragOver={this._dragOver}
          onDragLeave={this._dragEnd}
          onDragEnd={this._dragEnd}
          onDrop={this._drop}>
        <Uploader onUpload={this.props.onUpload}/>
      </div>
    }
    return <div
        className={classnames('ImageBase', this.state.dragging && 'ImageBase-dragging')}
        onClick={this.props.onClick} 
        onDragEnter={this._dragOver}
        onDragOver={this._dragOver}
        onDragLeave={this._dragEnd}
        onDragEnd={this._dragEnd}
        onDrop={this._drop}>
      <img src={this.props.src} title={this.props.title}/>
      <div onClick={e => {
        e.stopPropagation()
        this.props.onUpload(null)
      }} className='ImageBase_close'>&times;</div>
    </div>
  },
})

var ImageRenderer = React.createClass({
  render: function () {
    var img = <ImageBase
      src={this.props.src}
      title={this.props.title}
      onClick={this.props.onClick}
      onUpload={this.props.setSrc}/>
    if (this.props.title && this.props.title.trim()) {
      return <div>
        {img}
        <DefaultRenderer onClick={this.props.onClick} content={this.props.title}/>
      </div>
    }
    return img
  },
})

var ImageEditor = React.createClass({

  focus: function () {
    return this.refs.text.focus.apply(null, arguments)
  },
  isFocused: function () {
    return this.refs.text.isFocused.apply(null, arguments)
  },

  _onPaste: function (e) {
    var file = e.clipboardData.items[0].getAsFile()
    if (!file) return
    e.preventDefault()
    getSrc(file, this.props.setSrc)
  },

  render: function () {
    var props = this.props.editProps
    props.onPaste = this._onPaste

    return <div>
      <ImageBase src={this.props.src} title={this.props.title} onUpload={this.props.setSrc}/>
      {React.createElement(DefaultEditor, props)}
    </div>
  },
})

module.exports = {
  title: 'Image Node',

  types: {
    image: {
      title: 'Image',
      shortcut: 'i',
    }
  },

  contextMenu: function (node, store) {
    if (node.imageSrc) {
      return {
        title: 'Remove image',
        action: 'removeImage',
      }
    }
  },

  store: {
    actions: {
      'removeImage': function (id) {
        if (!id) id = this.view.active
        this.set(id, 'imageSrc', null)
      },
    },
  },

  node: {
    bodies: {
      image: {
        renderer: function () {
          var click = () => {
            if (this.props.editState) return
            this.props.actions.edit(this.props.node.id)
          }
          var setSrc = this.props.store.actions.set.bind(this.props.store.actions, this.props.node.id, 'imageSrc')
          return <ImageRenderer
            onClick={click}
            setSrc={setSrc} 
            src={this.props.node.imageSrc}
            title={this.props.node.content}/>
        },

        editor: function (props) {
          var setSrc = props.store.actions.set.bind(props.store.actions, props.node.id, 'imageSrc')
          return <ImageEditor
            editProps={props}
            setSrc={setSrc}
            ref={props.ref}
            src={props.node.imageSrc}
            title={props.node.content}/>
        },
      }
    }
  }
}

