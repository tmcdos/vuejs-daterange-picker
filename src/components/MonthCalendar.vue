<template>
  <div>
    <div class="calendar-header">
      <div title="Prev" class="prev-box" @click="doPrev">
        <svg viewBox="0 0 32 32" width="14px" height="14px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="arrow-active">
          <path d="M 16,32 C 24.836,32 32,24.836 32,16.002 32,7.164 24.836,0 16,0 7.164,0 0,7.164 0,16.002 0,24.836 7.164,32 16,32 Z M 19.936159,8.9720854 19.962432,23.075732 8.0525452,16.028273 Z" />
        </svg>
      </div>
      <div class="calendar-title">
        <span class="calendar-month">{{ cal_month | month_name }}</span>&nbsp;<span class="calendar-year">{{ cal_year }}</span>
      </div>
      <div title="Next" class="next-box" @click="doNext">
        <svg viewBox="0 0 32 32" width="14px" height="14px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" :class="[last_month ? 'arrow-disabled' : 'arrow-active']">
          <path d="M 16,32 C 7.164,32 0,24.836 0,16.002 0,7.164 7.164,0 16,0 24.836,0 32,7.164 32,16.002 32,24.836 24.836,32 16,32 Z M 12.063841,8.9720854 12.037568,23.075732 23.947455,16.028273 Z" />
        </svg>
      </div>
    </div>
    <table class="calendar-table">
      <thead>
        <tr>
          <th v-for="week_day in daysWeek" :class="[week_day>5 ? 'calendar-weekend' : '']"><span :title="date_name(week_day)">{{ week_day | short_day }}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="week in weeksMonth">
          <td v-for="(date,idx) in makeWeek(week)" @click="selectDay(date)">
            <span :class="[date != 0 ? 'date-cell' : '', idx<5 ? '' : 'cell-weekend', cal_style(date,idx+1)]">{{ date != 0 ? date : '' }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

export default
{
  name: 'month-calendar',
  props:
  {
    datum:
    {
      type: Date,
      required: true
    },
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
    };
    return tmp; // without Var there are strange unlogical syntax errors
  },
  mounted: function ()
  {
    this.$emit('ready',this);
  },
  computed:
  {
    cal_year: function()
    {
      return this.datum.getFullYear();
    },
    cal_month: function()
    {
      return this.datum.getMonth();
    },
    week_start: function()
    {
      var p = this.options;
      if(p.week_start == null || p.week_start < 1 || p.week_start > 7) return 1; // 1=Monday, 7=Sunday
        else return p.week_start;
    },
    // return week days ordered from Week_Start
    daysWeek: function()
    {
      var day = this.week_start;
      return [ // [ must be on the same row, otherwise strange behavior
        day,
        this.week_mod(day+1),
        this.week_mod(day+2),
        this.week_mod(day+3),
        this.week_mod(day+4),
        this.week_mod(day+5),
        this.week_mod(day+6)
      ];
    },
    // get number of days in the month
    month_days: function()
    {
      return new Date(this.cal_year, 1+this.cal_month, 0).getDate();
    },
    // get day of the week for 1-st date in the month
    first_day: function()
    {
      var d = this.datum;
      d.setDate(1);
      var start = d.getDay();
      if(start==0) start = 7;
      return start;
    },
    // how many weeks spans the current month
    weeksMonth: function()
    {
      var max = this.month_days;
      if(max<=28) return [0,1,2,3];
      if(max+(this.first_day-1)<=35) return [0,1,2,3,4];
      return [0,1,2,3,4,5];
    },
    max_today: function()
    {
      if(this.options.max_today == null) return true; // disable dates in the future
        else return this.options.max_today;
    },
    last_month: function()
    {
      if(this.max_today)
      {
        var d = new Date(), y = d.getFullYear();
        if(this.cal_year > y) return true;
        if(this.cal_year == y && this.cal_month >= d.getMonth()) return true;
      }
      return false;
    },
  },
  filters:
  {
    // full name of the month
    month_name: function(m)
    {
      switch(m)
      {
        case 0: return 'January';
        case 1: return 'February';
        case 2: return 'March';
        case 3: return 'April';
        case 4: return 'May';
        case 5: return 'June';
        case 6: return 'July';
        case 7: return 'August';
        case 8: return 'September';
        case 9: return 'October';
        case 10: return 'November';
        case 11: return 'December';
      }
    },
    // minimized names of the week days
    short_day: function(w)
    {
      switch(w)
      {
        case 1: return 'Mo';
        case 2: return 'Tu';
        case 3: return 'We';
        case 4: return 'Th';
        case 5: return 'Fr';
        case 6: return 'Sa';
        case 7: return 'Su';
        default: return '';
      }
    }
  },
  methods:
  {
    // wrap around days of the week
    week_mod: function(x)
    {
      return (x<=7 ? x : x - 7);
    },
    // full name of the week day
    date_name: function(w)
    {
      switch(w)
      {
        case 1: return 'Monday';
        case 2: return 'Tuedays';
        case 3: return 'Wednesday';
        case 4: return 'Thursday';
        case 5: return 'Friday';
        case 6: return 'Saturday';
        case 7: return 'Sunday';
        default: return '';
      }
    },
    // emit event when user clicks on a date
    selectDay: function(val)
    {
      if(this.is_disabled(val)) return;
      var d = new Date();
      d.setFullYear(this.cal_year, this.cal_month, val);
      d.setHours(0);
      d.setMinutes(0);
      d.setSeconds(0);
      d.setMilliseconds(0);
      this.$emit('onSelect',d);
    },
    is_today: function(mday)
    {
      var d = new Date();
      return (this.cal_year == d.getFullYear() && this.cal_month == d.getMonth() && mday == d.getDate());
    },
    is_disabled: function(mday)
    {
      var d = new Date(), y = d.getFullYear(), m = d.getMonth();
      if(this.max_today)
      {
        if(this.cal_year > y) return true;
        if(this.cal_year == y && this.cal_month > m) return true;
        if(this.cal_year == y && this.cal_month == m && mday > d.getDate()) return true;
      }
      return false;
    },
    // determines the CSS style for a date
    // mday = day of the month (1-31)
    // dow = day of the week (1-7)
    cal_style: function(mday,dow)
    {
      // selection has highest priority
      if(this.options.start_date != null)
      {
        var s = this.options.start_date;
        var y1 = s.getFullYear(), m1 = s.getMonth(), d1 = s.getDate();
        if(this.options.final_date == null)
        {
          // period is still open - only the start date is considered part of the period
          if(y1 == this.cal_year && m1 == this.cal_month && d1 == mday) return 'period';
        }
        else
        {
          // we have a complete inclusive period
          var f = this.options.final_date;
          var y2 = f.getFullYear(), m2 = f.getMonth(), d2 = f.getDate();
          if(y1 == this.cal_year)
          {
            if(m1 < this.cal_month)
            {
                if(this.cal_year < y2) return 'period';
                if(this.cal_year == y2)
                {
                  if(this.cal_month < m2) return 'period';
                  if(this.cal_month == m2)
                  {
                    if(mday <= d2) return 'period';
                  }
                }
            }
            if(m1 == this.cal_month)
            {
              if(d1 == mday) return 'period';
              if(d1 < mday)
              {
                if(this.cal_year < y2) return 'period';
                if(this.cal_year == y2)
                {
                  if(this.cal_month < m2) return 'period';
                  if(this.cal_month == m2)
                  {
                    if(mday <= d2) return 'period';
                  }
                }
              }
            }
          }
          if(y1 < this.cal_year)
          {
                if(this.cal_year < y2) return 'period';
                if(this.cal_year == y2)
                {
                  if(this.cal_month < m2) return 'period';
                  if(this.cal_month == m2)
                  {
                    if(mday <= d2) return 'period';
                  }
                }
          }
        }
      }
      if(this.is_today(mday)) return 'today-cell';
      if(this.is_disabled(mday)) return 'disabled-cell';
      return 'any-cell';
    },
    // returns array of the month dates for the given week (0-5) in the month
    // if an element is 0 - it is not shown (replaced with whitespace)
    makeWeek: function(w)
    {
      var start = this.first_day, max = this.month_days, day = 7*w - (start-1) + 1;
      var res =
      [
        day   > max ? 0 : (day   < 1 ? 0 : day),
        day+1 > max ? 0 : (day+1 < 1 ? 0 : day+1),
        day+2 > max ? 0 : (day+2 < 1 ? 0 : day+2),
        day+3 > max ? 0 : (day+3 < 1 ? 0 : day+3),
        day+4 > max ? 0 : (day+4 < 1 ? 0 : day+4),
        day+5 > max ? 0 : (day+5 < 1 ? 0 : day+5),
        day+6 > max ? 0 : (day+6 < 1 ? 0 : day+6),
      ];
      return res;
    },
    doPrev: function()
    {
      this.$emit('onPrev');
    },
    doNext: function()
    {
      if(!this.last_month) this.$emit('onNext');
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

@mixin bord-rad-left($radius)
{
  -webkit-border-top-left-radius: $radius;
     -moz-border-top-left-radius: $radius;
      -ms-border-top-left-radius: $radius;
          border-top-left-radius: $radius;
  -webkit-border-bottom-left-radius: $radius;
     -moz-border-bottom-left-radius: $radius;
      -ms-border-bottom-left-radius: $radius;
          border-bottom-left-radius: $radius;
}

@mixin bord-rad-right($radius)
{
  -webkit-border-top-right-radius: $radius;
     -moz-border-top-right-radius: $radius;
      -ms-border-top-right-radius: $radius;
          border-top-right-radius: $radius;
  -webkit-border-bottom-right-radius: $radius;
     -moz-border-bottom-right-radius: $radius;
      -ms-border-bottom-right-radius: $radius;
          border-bottom-right-radius: $radius;
}

.calendar-header
{
  display: flex;
  border: 1px solid #aaa;
  background-color: #DEDEDE;
  padding: .2em 0;
}

.cal_left > .calendar-header
{
  @include bord-rad-left($bord_radius);
}

.cal_right > .calendar-header
{
  @include bord-rad-right($bord_radius);
}

.calendar-title
{
  margin: 0 1em;
  line-height: 1.8em;
  text-align: center;
  color: #222;
  font-weight: bold;
  flex-grow: 1;
}

.prev-box,
.next-box
{
  display: none;
  padding: 1pt 4pt;
  margin: 0 2px;
  border: 1px solid transparent;
  @include border-radius($bord_radius);
}

.cal_left .prev-box
{
  display: table-cell;
}

.cal_right .next-box
{
  display: table-cell;
}

.prev-box:hover,
.next-box:hover
{
  border: 1px solid #999;
}

.arrow-active,
.arrow-disabled
{
  vertical-align: middle;
  margin: auto;
}

.arrow-disabled
{
  opacity: .35;
  filter: Alpha(Opacity=35);
}

.calendar-table
{
  margin: 0 auto .4em;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: .9em;
}

.calendar-table th
{
  padding: .7em .3em;
  text-align: center;
  font-weight: 700;
}

.calendar-table td
{
  text-align: right;
  padding: 1px;
}

.calendar-weekend
{
  color: red;
}

.date-cell
{
  border: 1px solid #D3D3D3;
  color: #555;
  display: block;
  padding: .2em;
}

.any-cell
{
  background-color: #EEE;
  cursor: pointer;
}

.any-cell:hover
{
  background-color: #DADADA;
}

.today-cell
{
  background-color: #FCEFA1;
  cursor: pointer;
}

.any-cell:hover,
.today-cell:hover
{
  border: 1px solid #999;
  color: #212121;
}

.disabled-cell
{
  cursor: default;
  background-color: #E6E6E6;
  opacity: .35;
  filter: Alpha(Opacity=35);
}

/* after other cell types, but before PERIOD */
.cell-weekend
{
  color: red;
}

.period
{
  color: #fff;
  background-color: #B0C4DE;
  cursor: pointer;
}

.period:hover
{
  border: 1px solid #999;
}
</style>
