import React from 'react';
import {GLOBAL_CONFIG} from '../config/config.js';
import Animation from './Animation.jsx';
import {stopAnimation, addObjectives, addSizes} from './../reducers/actions';
import * as Utils from '../vendors/Utils.js';
import Icon from './Icon.jsx';

export default class Quiz extends React.Component {
  constructor(props){
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.calculateImgsSizes = this.calculateImgsSizes.bind(this);
    this.toggleFeedback = this.toggleFeedback.bind(this);
    this.total_score = this.props.questions.reduce((accumulator, currentValue) => { return accumulator + currentValue.score; }, 0);
    this.state = {hide_feedback: false};
  }
  toggleFeedback(){
    this.setState({hide_feedback: !this.state.hide_feedback});
  }
  updateDimensions() {
    if(this.img && this.box){
      let question = this.props.questions[this.props.index]
      let imgaspect = question.width/question.height;
      let boxaspect = this.box.clientWidth/this.box.clientHeight;
      if(imgaspect > boxaspect){
        this.img.style.height = (this.box.offsetHeight - this.nav.clientHeight -7) + "px";
        this.img.style.width = "auto";
      } else {
        this.img.style.height = "";
        this.img.style.width = "";
      }
    }
  }
  calculateImgsSizes(){
    let nQuestions = this.props.questions.length;
    let only_imgs_length = this.props.questions.filter((q) =>{return q.type!=="iframe";}).length;
    let processed = 0;
    let sizes = [];
    for(let i = 0; i < nQuestions; i++){
      if(this.props.questions[i].type==="iframe"){
        sizes[i] = null;
      } else {
        let img = new Image();

        img.onload = function(){
          let height = img.height;
          let width = img.width;
          // code here to use the dimensions
          processed +=1;
          sizes[+img.id] = {width: width, height: height};
          if(processed===only_imgs_length){
            this.props.dispatch(addSizes(sizes));
          }
        }.bind(this);
        img.id = i;
        img.src = this.props.questions[i].path;
      }
    }
  }
  componentDidMount(){
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
    this.calculateImgsSizes();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }
  componentDidUpdate(prevProps, prevState){
    if(prevProps.index !==this.props.index){
      this.updateDimensions();
    }
  }
  render(){
    let question = this.props.questions[this.props.index];
    if(this.props.game.game_started && question){
      let answer_right = question.answered && question.score === question.score_accomplished;
      let answer_wrong = question.answered && question.score !== question.score_accomplished;
      let feedback1, feedback2, feedback1_class, feedback2_class;

      if(answer_right){
        feedback1 = "has acertado";
        feedback1_class = "user_answer user_right_answer";
      } else if(answer_wrong){
        feedback1 = "has fallado";
        feedback1_class = "user_answer user_wrong_answer";
      } else {
        feedback1 = "no has respondido esta pregunta";
        feedback1_class = "user_answer user_not_answer";
      }

      if(question.true_or_false){
        feedback2 = this.props.data.feedback2_right;
        feedback2_class = "question right_question";
      } else {
        feedback2 = this.props.data.feedback2_wrong;
        feedback2_class = "question wrong_question";
      }

      let show_feedback;
      if(this.props.game.game_ended || (question.answered && answer_wrong) || (question.answered && answer_right && question.show_animation === false)){
        show_feedback =true;
      } else {
        show_feedback = false;
      }

      let feedback_component = <div className={"feedback_header " + feedback1_class} ref={(feedback) => { this.feedback = feedback; }}>{feedback1 + ": " + feedback2}</div>;
      let nav_sec_class = (question.secure === true) ? "nav_secure fa fa-lock" : "nav_no-secure fa fa-info-circle";
      let feedback_iframe;
      let toggle_feedback_button;
      if(question.type ==="iframe" && show_feedback){
        if(question.true_or_false === false){
          feedback_iframe = <div className={"feedback_iframe " + (this.state.hide_feedback ? "redux":"")} key={1}><div className={"feedback_i_content " + (this.state.hide_feedback ? "hide_op":"")}><p className="content01">{question.source_name}</p> <p className="content02">es un bulo sobre la salud como hay muchos. conviene contrastar la información y con una simple búsqueda en internet podemos ver que es falsa, por ejemplo <a href={question.feedback_search} target="_blank">con esta simple búsqueda</a></p><p className="content03">podemos encontrar webs muy útiles dedicadas a destapar este tipo de bulos, por ejemplo este lo desmienten en <a href={question.feedback_path} target="_blank">{question.feedback_sitename}</a></p></div><div className="toggleFeedback" onClick={() => this.toggleFeedback()} key={0}>ver feedback <Icon icon="down_arrow" className={"control control_down_arrow"}/></div></div>;
        } else {
          feedback_iframe = <div className={"feedback_iframe " + (this.state.hide_feedback ? "redux":"")} key={1}><div className={"feedback_i_content " + (this.state.hide_feedback ? "hide_op":"")}><p className="content01">{question.source_name}</p><p className="content02">fíjate que viene de un medio reputado y que si buscas en internet información adicional verás la noticia en diferentes webs y periódicos también de prestigio</p></div><div className="toggleFeedback" onClick={() => this.toggleFeedback()} key={0}>ver feedback <Icon icon="down_arrow" className={"control control_down_arrow"}/></div></div>;
        }
      }


      return (
          <div className="main_box" ref={(box) => { this.box = box; }}>
            {show_feedback ? feedback_component : null}
            <Animation dispatch={this.props.dispatch} show={question.show_animation} feedback1={feedback1} feedback2={feedback2} index={this.props.index} className1={feedback1_class} className2={feedback2_class}/>
            <div className={"nav_box " + (show_feedback ? "with_feedback" : "") }>
              <div className="nav_position" ref={(nav) => { this.nav = nav; }}>
                <div className="nav_top">
                  <div className="nav_circles">
                    <span className="nav_c c_red"></span>
                    <span className="nav_c c_yellow"></span>
                    <span className="nav_c c_green"></span>
                  </div>
                  <div className="nav_tab">
                    <span className="tab_title">FakeDetector</span>
                    <span className="tab_cross fa fa-times"></span>
                  </div>
                  <div className="nav_plus fa fa-plus">
                  </div>
                </div>
                <div className="nav_bottom">
                  <div className="nav_icons">
                    <span className="nav_i i_right_arrow fa fa-chevron-left"></span>
                    <span className="nav_i i_left_arrow fa fa-chevron-right"></span>
                    <span className="nav_i i_refresh fa fa-refresh"></span>
                  </div>
                  <div className="box_url">
                    <div className="url_group">
                      <span className={nav_sec_class}></span>
                      <span className="nav_url">{question.source_url}</span>
                    </div>

                    <span className="nav_star fa fa-star-o"></span>
                  </div>
                  <div className="three_dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>

              </div>
            </div>
            <div className={"image_box " + (show_feedback ? "with_feedback" : "") }>
              {question.type ==="iframe" ?
                <div className="iframeparent" style={{height:this.box.offsetHeight + "px"}}><iframe src={question.path} scrolling="no" className="eduiframe" ></iframe></div>
              :<img ref={(img) => { this.img = img; }} className={"quiz_image" + (question.with_margins ? " with_margins":"")} src={show_feedback ? question.feedback_path:question.path} />
            }
            </div>
            {(question.type ==="iframe" && show_feedback && question.show_animation===false) &&
              feedback_iframe
            }
          </div>
      );
    } else {
      return (
          <div className="main_box" ref={(box) => { this.box = box; }}>
            <p className="main_text">{this.props.data.initial_text}</p>
          </div>
      );
    }

  }
}
