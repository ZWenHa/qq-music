<template>
    <scroll 
        class="suggest" 
        :data="result" 
        :pullup="pullup"
        @scrollToEnd="searchMore"
        ref="suggest"
        :beforeScroll="beforeScroll"
        @beforeScroll="listScroll"
    >
        <ul class="suggest-list">
            <li @click="selectItem(item)" class="suggest-item" v-for="(item,index) in result" :key="index">
                <div class="icon">
                    <i :class="getIconCls(item)"></i>
                </div>
                <div class="name">
                    <p class="text" v-html="getDisplayName(item)"></p>
                </div>
            </li>
            <loading v-show="hasMore" title=""></loading>
        </ul>
        <div v-show="!hasMore && !result.length" class="no-result-wrapper">
            <no-result title="抱歉，暂无搜索结果"></no-result>
        </div>
    </scroll>
</template>
<script>
import {search} from 'api/search'
import {ERR_OK} from 'api/config'
import {getSongVkey}  from 'api/singer'
import {createSong} from 'common/js/song' 
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import Singer from 'common/js/singer'
import {mapMutations,mapActions} from 'vuex'
import NoResult from 'base/no-result/no-result'
const TYPE_SINGER = 'singer'
const perpage = 20  
 export default {
    data(){
        return{
            page:1,
            result:[],
            pullup: true,
            hasMore: true,
            searchSongs: {},
            firstList: [],
            zhida: {},
            beforeScroll: true
        }
    },
    props: {
        query:{
            type:String,
            default: ''
        },
        showSinger:{
            type: Boolean,
            default: true
        }
    },
    methods:{
        selectItem(item){
            if(item.type === TYPE_SINGER){
                const singer = new Singer({
                    id: item.singermid,
                    name: item.singername
                })
                this.$router.push({
                    path:`/search/${singer.id}`
                }),
                this.setSinger(singer)
            }else{
                this.insertSong(item)
            }
            this.$emit('select')
        },
        getDisplayName(item){
            if(item.type === TYPE_SINGER){
                return item.singername
            }else{
                return `${item.name}-${item.singer}`
            }
        },
        getIconCls(item){
            if(item.type === TYPE_SINGER){
                return 'icon-mine'
            }else{
                return 'icon-music'
            }
        },
        searchMore(){
            if(!this.hasMore){
                return
            }
            this.page++
            console.log(this.page)
            search(this.query,this.page,this.showSinger,perpage).then((res)=>{
                if(res.code === ERR_OK){
                   this.searchSongs = this._normalizeSongs(this.firstList.concat(res.data.song.list))
                    this._checkMore(res.data)
                }
            })
        },
        listScroll(){
            this.$emit('listScroll')
        },
        _checkMore(data){
            const song = data.song
            if(!song.list.length || (song.curnum + song.curpage * perpage)>song.totalnum){
                this.hasMore = false
            }
        },
        _search(){
            this.page = 1
            this.$refs.suggest.scrollTo(0,0)
            this.hasMore = true
            search(this.query,this.page,this.showSinger,perpage).then((res)=>{
                if(res.code === ERR_OK){
                    //this.result = this._genResult(res.data)
                    this.zhida =res.data.zhida
                    this.firstList = res.data.song.list
                    this.searchSongs = this._normalizeSongs(res.data.song.list)
                    this._checkMore(res.data)
                }
            })
        },
        // _genResult(data){
        //     let ret = []
        //     if(data.zhida && data.zhida.singerid){
        //         ret.push({...data.zhida,...{type:TYPE_SINGER}})
        //     }
        //     if(data.song){
        //        // console.log(this._normalizeSongs(data.song.list).length)
        //        // ret = ret.concat(this._normalizeSongs(data.song.list))
        //     }
        //     return ret
        // },
        _genResult(data, newValue){
            let ret = []
            if(data.singerid){
                ret.push({...this.zhida,...{type:TYPE_SINGER}})
            }
            if(newValue){
                ret = ret.concat(newValue)
            }
            console.log(ret)
            this.result = ret
        },
        _normalizeSongs(list){
            let ret = []
            let pushIndex = 0
            list.forEach((musicData)=>{
                if(musicData.songid && musicData.albummid){
                    getSongVkey(musicData.songmid).then((res) => {
                        const vkey = res.data.items[0].vkey
                        ret.push(createSong(musicData,vkey))
                        pushIndex++
                        this.pushOver = (list.length === pushIndex)
                    })
                }
            })
            return ret
        },
        ...mapMutations({
            setSinger: 'SET_SINGER'
        }),
        ...mapActions([
            'insertSong'
        ])
    },
    watch:{
        query(newQuery){
            this._search(newQuery)
        },
        searchSongs(newValue){
            if(this.pushOver){
                this._genResult(this.zhida, newValue)
            }
        }
    },
    components:{
        Scroll,
        Loading,
        NoResult
    }
}
</script>
<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
