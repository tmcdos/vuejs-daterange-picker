<template>
  <div class="picker_div">
    <button type="button" class="triggerbutton" role="button" aria-disabled="false" @click="toggleCalendar">
      <span class="triggerbutton-text">{{ placeholder }}</span>
      <span class="triggerbutton-icon">&#9660;</span>
    </button>
    <div class="daterangepicker" v-if="is_opened" :style="picker_style">
      <div class="flex-row">
        <preset-ranges :presets="options.presets" @onPreset="doPreset"></preset-ranges>
        <div class="flex-row calendar" v-if="month_cnt <= 1">
          <month-calendar class="cal_left cal_right" :datum="month_right" :options="params" @onSelect="doSelect" @onPrev="doPrev" @onNext="doNext"></month-calendar>
        </div>
        <div class="flex-row calendar" v-if="month_cnt == 2">
          <month-calendar class="cal_left"  :datum="month_center" :options="params" @onSelect="doSelect" @onPrev="doPrev"></month-calendar>
          <month-calendar class="cal_right" :datum="month_right"  :options="params" @onSelect="doSelect" @onNext="doNext"></month-calendar>
        </div>
        <div class="flex-row calendar" v-if="month_cnt >= 3">
          <month-calendar class="cal_left"   :datum="month_left"   :options="params" @onSelect="doSelect" @onPrev="doPrev"></month-calendar>
          <month-calendar class="cal_center" :datum="month_center" :options="params" @onSelect="doSelect"></month-calendar>
          <month-calendar class="cal_right"  :datum="month_right"  :options="params" @onSelect="doSelect" @onNext="doNext"></month-calendar>
        </div>
      </div>
      <div class="button-panel" v-if="txt_apply !='' || txt_clear !='' || txt_cancel !=''">
        <button aria-disabled="false" class="button-primary" role="button" type="button" v-if="txt_apply != ''" @click="doApply">
          <span class="button-text">{{ txt_apply }}</span>
        </button>
        <button aria-disabled="false" class="button-secondary" role="button" type="button" v-if="txt_clear != ''" @click="doClear">
          <span class="button-text">{{ txt_clear }}</span>
        </button>
        <button aria-disabled="false" class="button-secondary" role="button" type="button" v-if="txt_cancel != ''" @click="doCancel">
          <span class="button-text">{{ txt_cancel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import PresetRanges from './PresetRanges.vue'
import MonthCalendar from './MonthCalendar.vue'

export default
{
  name: 'date-time-picker',
  components:
  {
    PresetRanges,
    MonthCalendar
  },
  props:
  {
    options:
    {
      type: Object,
      default: function()
      {
        return {};
      }
    }
  },
  data: function()
  {
    var tmp =
    {
			dateFormat: 'M d, yy', // displayed date format. Available formats: http://api.jqueryui.com/datepicker/#utility-formatDate
			altFormat: 'yy-mm-dd', // submitted date format - inside JSON {"start":"...","end":"..."}
			verticalOffset: 0, // offset of the dropdown relative to the closest edge of the trigger button
			mirrorOnCollision: true, // reverse layout when there is not enough space on the right
			autoFitCalendars: true, // override datepicker's numberOfMonths option in order to fit widget width
      is_opened: false,
      pos_x: 200,
      pos_y: 200,
      datum: null,
      start_date: this.options.start_date,
      final_date: this.options.final_date,
      old_start: null,
      old_final: null,
      state: 0, // the state of the finite automata
    };
    return tmp; // without Var there are strange unlogical syntax errors
  },
  created: function()
  {
    this.datum = this.cur_date;
  },
  computed:
  {
    splitter: function()
    {
      if(this.options.rangeSplitter == null || this.options.rangeSplitter == '') return ' - ';
        else return this.options.rangeSplitter;
    },
    txt_apply: function()
    {
      // use "" to get rid of the button
      if(this.options.apply_text == null) return 'Apply';
        else return this.options.apply_text;
    },
    txt_clear: function()
    {
      // use "" to get rid of the button
      if(this.options.clear_text == null) return 'Clear';
        else return this.options.clear_text;
    },
    txt_cancel: function()
    {
      // use "" to get rid of the button
      if(this.options.cancel_text == null) return 'Cancel';
        else return this.options.cancel_text;
    },
    placeholder: function()
    {
      // placeholder text - shown when nothing is selected
      if(this.start_date != null && this.final_date != null) return this.rangeText;
      else
      {
        if(this.options.placeholder == null) return 'Select date range...';
          else return this.options.placeholder;
      }
    },
    month_cnt: function()
    {
      if(this.options.number_months == null) return 3;
        else return this.options.number_months;
    },
    max_today: function()
    {
      if(this.options.max_today == null) return true; // disable dates in the future
        else return this.options.max_today;
    },
    cur_date: function()
    {
      if(typeof this.options.cur_date == 'object' && typeof this.options.cur_date.getMonth === 'function') return this.options.cur_date;
        else return new Date();
    },
    inline_picker: function()
    {
      if(this.options.inline_picker == null) return false;
        else return this.options.inline_picker;
    },
    week_start: function()
    {
      var p = this.options;
      if(p.week_start == null || p.week_start < 1 || p.week_start > 7) return 1; // 1=Monday, 7=Sunday
        else return p.week_start;
    },
    // expects non-NULL period
    rangeText: function()
    {
      var s = this.moment(this.start_date), f = this.moment(this.final_date);
      return s.format('DD-MM-YYYY') + this.splitter + f.format('DD-MM-YYYY');
    },
    // whether to auto apply menu presets
    applyOnMenuSelect: function()
    {
      if(this.options.applyOnMenuSelect == null) return true;
        else return this.options.applyOnMenuSelect;
    },
    cur_date: function()
    {
      if(this.options.cur_date == null) return new Date();
        else return this.options.cur_date;
    },
    vertical_offset: function()
    {
      if(this.options.verticalOffset == null) return 4;
        else return this.options.verticalOffset;
    },
    month_left: function()
    {
      // the month before previous
      var d = new Date(), y = this.datum.getFullYear(), m = this.datum.getMonth();
      m--;
      m--;
      if(m<0)
      {
        m += 12;
        y--;
      }
      d.setFullYear(y,m,1);
      return d;
    },
    month_center: function()
    {
      // previous month
      var d = new Date(), y = this.datum.getFullYear(), m = this.datum.getMonth();
      m--;
      if(m<0)
      {
        m += 12;
        y--;
      }
      d.setFullYear(y,m,1);
      return d;
    },
    month_right: function()
    {
      // current month
      return this.datum;
    },
    params: function()
    {
      var tmp =
      {
        max_today: this.max_today,
        week_start: this.week_start,
        start_date: this.start_date,
        final_date: this.final_date
      };
      return tmp;
    },
    picker_style: function()
    {
      var tmp = {};
      if(this.inline_picker)
      {
        tmp.position = 'static';
        tmp['margin-top'] = this.vertical_offset + 'px';
      }
      else
      {
        tmp.position = 'absolute';
        tmp['z-index'] = '99';
      }
      return tmp;
    }
  },
  methods:
  {
    // inject the Moment.JS
    moment: function(x)
    {
      return moment(x);
    },
    toggleCalendar: function()
    {
      this.is_opened = ! this.is_opened;
      if(this.is_opened)
      {
        this.old_start = this.start_date;
        this.old_final = this.final_date;
        setTimeout(this.reposition,25);
      }
    },
    doApply: function()
    {
      this.is_opened = false;

      this.$emit('onApply',this.start_date,this.final_date);
    },
    doClear: function()
    {
      this.start_date = null;
      this.final_date = null;
      this.state = 0;
    },
    doCancel: function()
    {
      this.start_date = this.old_start;
      this.final_date = this.old_final;
      this.is_opened = false;
      this.$emit('onCancel');
    },
    doPreset: function(range_start,range_end)
    {
      this.start_date = range_start;
      this.final_date = range_end;
      if(this.applyOnMenuSelect) this.doApply();
    },
    doSelect: function(d) // receives a Date() object with zeroed time part
    {
      switch(this.state)
      {
        case 0: // 1-st click
          this.start_date = d;
          this.final_date = null;
          this.state = 1;
          break;
        case 1: // 2-nd click
          if(this.start_date <= d) this.final_date = d;
          else
          {
            this.final_date = this.start_date;
            this.start_date = d;
          }
          this.state = 0;
          break;
      }
    },
    doPrev: function()
    {
      var d = new Date(), y = this.datum.getFullYear(), m = this.datum.getMonth();
      m--;
      if(m<0)
      {
        m += 12;
        y--;
      }
      d.setFullYear(y,m,1);
      this.datum = d;
    },
    doNext: function()
    {
      var d = new Date(), y = this.datum.getFullYear(), m = this.datum.getMonth();
      m++;
      if(m>11)
      {
        m -= 12;
        y++;
      }
      d.setFullYear(y,m,1);
      this.datum = d;
    },
    getLeftOfs: function(el)
    {
      var ol=el.offsetLeft;
      while ((el=el.offsetParent) != null)
        ol += el.offsetLeft;
      return ol;
    },
    getTopOfs: function(el)
    {
      var ot=el.offsetTop;
      while((el=el.offsetParent) != null)
        ot += el.offsetTop;
      return ot;
    },
    reposition: function()
    {
      if(this.$el.childElementCount > 1)
      {
        var sibling = this.$el.children[0], picker = this.$el.children[1],
          left = sibling.offsetLeft, top = sibling.offsetTop + sibling.clientHeight + parseInt(this.vertical_offset),
          wh = parseInt(window.innerHeight), bh = parseInt(document.body.clientHeight),
          ww = parseInt(window.innerWidth), bw = parseInt(document.body.clientWidth);
          /*
        if ((top + parseInt(picker.clientHeight) - parseInt(document.body.scrollTop)) > (wh > bh ? wh : bh))
          top = (parseInt(document.body.scrollTop) + bh - parseInt(picker.clientHeight) - 16);
        if ((left + parseInt(picker.clientWidth) - parseInt(document.body.scrollLeft)) > (ww > bw ? ww : bw))
          left = (parseInt(document.body.scrollLeft) + bw - parseInt(picker.clientWidth) - 16);
        if (left < 1) left = "1";
        if (top < 1) top = "1";
        */
        picker.style.top = top + 'px';
        picker.style.left = left + 'px';
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$bord_radius: 4px;

@mixin border-radius($radius)
{
  -webkit-border-radius: $radius;
     -moz-border-radius: $radius;
      -ms-border-radius: $radius;
          border-radius: $radius;
}

.picker_div
{
  display: table;
}

.triggerbutton
{
  display: flex;
	min-width: 18em;
  border: 1px solid #d3d3d3;
	@include border-radius($bord_radius);
	background-color: #E6E6E6;
}

.triggerbutton:hover
{
  border: 1px solid #999;
	background-color: #DADADA;
}

.triggerbutton-text
{
  flex-grow: 1;
  text-align: left;
  padding: .4em 1em;
  color: #555;
}

.triggerbutton-icon
{
  margin-top: 5pt;
}

.daterangepicker
{
  font-family: Verdana,Arial,sans-serif;
  padding: 5px;
  border: 1px solid #aaa;
	@include border-radius($bord_radius);
	background-color: #fff;
}

.button-panel
{
  border-top: 1px solid #aaa;
}

.button-primary,
.button-secondary
{
  margin-top: 6px;
  margin-right: 6px;
}

.button-primary
{
  font-weight: bold;
}

.button-secondary
{
  opacity: .7;
  filter: Alpha(Opacity=70);
}

.flex-row
{
  display: flex;
}

.calendar
{
  padding: 2pt 4pt;
}
</style>
