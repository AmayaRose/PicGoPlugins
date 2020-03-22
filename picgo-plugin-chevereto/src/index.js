module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('chevereto', {
      handle,
      name: 'Chevereto Uploader',
	  config: config
    })
  }
  const handle = async function (ctx) {
    let userConfig = ctx.getConfig('picBed.chevereto')
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }
    try {
      let imgList = ctx.output
      for (let i in imgList) {
        let image = imgList[i].buffer
        if (!image && imgList[i].base64Image) {
          image = Buffer.from(imgList[i].base64Image, 'base64')
        }
        const postConfig = postOptions(image, imgList[i].fileName, userConfig.url, userConfig.key)
        let body = await ctx.Request.request(postConfig)

        delete imgList[i].base64Image
        delete imgList[i].buffer
        body = JSON.parse(body)
        if (body['status_code'] == 200) {
          imgList[i]['imgUrl'] = body['image']['url']
        } else {
          ctx.emit('notification', {
            title: '上传失败',
            body: body.status_txt
          })
        }
      }
    } catch (err) {
      ctx.emit('notification', {
        title: '上传失败',
        body: '请检查服务端或配置'
      })
    }
  }

  const postOptions = (image, fileName, url, key) => {
    let headers = {
      'contentType': 'multipart/form-data',
      'User-Agent': 'PicGo'
    }
    let formData = {
      'key': key,
	  'format': 'json'
	}
    const opts = {
      method: 'POST',
      url: url,
      headers: headers,
      formData: formData
    }
    opts.formData['source'] = {}
    opts.formData['source'].value = image
    opts.formData['source'].options = {
      filename: fileName
    }
    return opts
  }

  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.chevereto')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'url',
        type: 'input',
        default: userConfig.url,
        required: true,
        message: '使用Chevereto的图床的API上传网址（如：https://example.com/api/1/upload）',
        alias: 'Url'
      },
      {
        name: 'key',
        type: 'input',
        default: userConfig.key,
        required: true,
        message: '在图床获取的Key',
        alias: 'Key'
      }
    ]
  }

  return {
    uploader: 'chevereto',
    register
  }
}
