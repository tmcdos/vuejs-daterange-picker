<template>
  <div>
    <div class="calendar-header">
      <div title="Prev" class="prev-box" @click="doPrev" v-if="!(first_month && hideNavigation)">
        <svg viewBox="0 0 32 32" width="14px" height="14px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" :class="[first_month ? 'arrow-disabled' : 'arrow-active']">
          <path d="M 16,32 C 24.836,32 32,24.836 32,16.002 32,7.164 24.836,0 16,0 7.164,0 0,7.164 0,16.002 0,24.836 7.164,32 16,32 Z M 19.936159,8.9720854 19.962432,23.075732 8.0525452,16.028273 Z" />
        </svg>
      </div>
      <div class="calendar-title" v-if="!swapMonYear">
        <span class="calendar-month">{{ month_name(cal_month) }}</span>&nbsp;<span class="calendar-year">{{ cal_year + (year_suffix != '' ? '&nbsp;'+year_suffix : '') }}</span>
      </div>
      <div class="calendar-title" v-if="swapMonYear">
        <span class="calendar-year">{{ cal_year + (year_suffix != '' ? '&nbsp;'+year_suffix : '') }}</span>&nbsp;<span class="calendar-month">{{ month_name(cal_month) }}</span>
      </div>
      <div title="Next" class="next-box" @click="doNext" v-if="!(last_month && hideNavigation)">
        <svg viewBox="0 0 32 32" width="14px" height="14px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" :class="[last_month ? 'arrow-disabled' : 'arrow-active']">
          <path d="M 16,32 C 7.164,32 0,24.836 0,16.002 0,7.164 7.164,0 16,0 24.836,0 32,7.164 32,16.002 32,24.836 24.836,32 16,32 Z M 12.063841,8.9720854 12.037568,23.075732 23.947455,16.028273 Z" />
        </svg>
      </div>
    </div>
    <table class="calendar-table">
      <thead>
        <tr>
          <th v-if="show_week">{{ week_header }}</th>
          <th v-for="week_day in daysWeek" :class="[is_weekend(week_day) ? 'calendar-weekend' : '']"><span :title="date_name(week_day)">{{ min_day(week_day) }}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="week in weeksMonth">
          <td v-if="show_week" class="calendar-weeks">{{ calc_week(week) }}</td>
          <td v-for="(date,idx) in makeWeek(week)" @click="selectDay(date)">
            <span :class="[date != 0 ? 'date-cell' : '', is_weekend(idx+1) ? 'cell-weekend' : '', cal_style(date,idx+1)]">{{ date != 0 ? Math.abs(date) : '' }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import moment from 'moment'

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
      today: new Date(),
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
      if(p.firstDay == null || p.firstDay < 1 || p.firstDay > 7) return 1; // 1=Monday, 7=Sunday
        else return p.firstDay;
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
    // get number of days in the previous month
    month_days_prev: function()
    {
      return new Date(this.cal_year, this.cal_month, 0).getDate();
    },
    // get day of the week for 1-st date in the month
    first_dow: function()
    {
      var d = this.datum;
      d.setDate(1);
      var start = d.getDay();
      if(start==0) start = 7;
      return start;
    },
    // get day of the week for 1-st date in the previous month
    first_dow_prev: function()
    {
      var d = new Date(this.cal_year, 1+this.cal_month, 0);
      d.setMonth(-1);
      var start = d.getDay();
      if(start==0) start = 7;
      return start;
    },
    // how many weeks spans the current month
    weeksMonth: function()
    {
      var max = this.month_days, dow = this.first_dow;
      if(max<28) return [0,1,2,3];
      if(max==28 && dow==1) return [0,1,2,3];
      if(max+(dow-1)<=35) return [0,1,2,3,4];
      return [0,1,2,3,4,5];
    },
    // how many weeks spans the previous month
    weeksMonthPrev: function()
    {
      var max = this.month_days_prev, dow = this.first_dow_prev;
      if(max<28) return [0,1,2,3];
      if(max==28 && dow==1) return [0,1,2,3];
      if(max+(this.first_dow_prev-1)<=35) return [0,1,2,3,4];
      return [0,1,2,3,4,5];
    },
    // check if current month is limited on the left
    first_month: function()
    {
      if(this.options.minDate != null)
      {
        var d = new Date();
        if(this.isDate(this.options.minDate)) d = this.options.minDate;
        else if(typeof this.options.minDate == 'number')
        {
          if(this.options.minDate < 0) d = this.moment().subtract(-this.options.minDate,'days').toDate();
            else d = this.moment().add(this.options.minDate,'days').toDate();
        }
        else if(typeof this.options.minDate == 'string')
        {
          // relative date (value + period pairs)
          d = this.relDate(this.options.minDate);
        }
        var y = d.getFullYear();
        if(this.cal_year < y) return true;
        if(this.cal_year == y && this.cal_month <= d.getMonth()) return true;
      }
      return false;
    },
    // check if current month is limited on the right
    last_month: function()
    {
      if(this.options.maxDate != null)
      {
        var d = new Date();
        if(this.isDate(this.options.maxDate)) d = this.options.maxDate;
        else if(typeof this.options.maxDate == 'number')
        {
          if(this.options.maxDate < 0) d = this.moment().subtract(-this.options.maxDate,'days').toDate();
            else d = this.moment().add(this.options.maxDate,'days').toDate();
        }
        else if(typeof this.options.maxDate == 'string')
        {
          // relative date (value + period pairs)
          d = this.relDate(this.options.maxDate);
        }
        var y = d.getFullYear();
        if(this.cal_year > y) return true;
        if(this.cal_year == y && this.cal_month >= d.getMonth()) return true;
      }
      return false;
    },
    swapMonYear: function()
    {
      if(this.options.showMonthAfterYear != null) return this.options.showMonthAfterYear;
        else return false;
    },
    hideNavigation: function()
    {
      if(this.options.hideIfNoPrevNext != null) return this.options.hideIfNoPrevNext;
        else return false;
    },
    year_suffix: function()
    {
      if(this.options.yearSuffix != null) return this.options.yearSuffix;
        else return '';
    },
    show_week: function()
    {
      if(this.options.showWeek != null) return this.options.showWeek;
        else return false;
    },
    week_header: function()
    {
      if(this.options.weekHeader != null) return this.options.weekHeader;
        else return 'Wk';
    },
    show_other_month: function()
    {
      if(this.options.showOtherMonths != null) return this.options.showOtherMonths;
        else return false;
    },
    select_other_month: function()
    {
      if(this.options.selectOtherMonths != null) return this.options.selectOtherMonths;
      else return false;
    }
  },
  methods:
  {
    // inject the Moment.JS
    moment: function(x)
    {
      return moment(x);
    },
    // wrap around days of the week
    week_mod: function(x)
    {
      return (x<=7 ? x : x - 7);
    },
    // full name of the month
    month_name: function(m)
    {
      var lst = this.options.monthNames;
      switch(m)
      {
        case 0: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'January';
        case 1: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'February';
        case 2: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'March';
        case 3: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'April';
        case 4: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'May';
        case 5: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'June';
        case 6: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'July';
        case 7: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'August';
        case 8: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'September';
        case 9: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'October';
        case 10: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'November';
        case 11: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'December';
        default: return 'N/A';
      }
    },
    month_short: function(m)
    {
      var lst = this.options.monthNamesShort;
      switch(m)
      {
        case 0: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Jan';
        case 1: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Feb';
        case 2: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Mar';
        case 3: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Apr';
        case 4: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'May';
        case 5: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Jun';
        case 6: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Jul';
        case 7: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Aug';
        case 8: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Sep';
        case 9: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Oct';
        case 10: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Nov';
        case 11: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Dec';
        default: return 'N/A';
      }
    },
    // minimized names of the week days
    min_day: function(w)
    {
      var lst = this.options.dayNamesMin;
      switch(w)
      {
        case 1: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Mo';
        case 2: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Tu';
        case 3: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'We';
        case 4: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Th';
        case 5: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Fr';
        case 6: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Sa';
        case 7: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Su';
        default: return 'N/A';
      }
    },
    short_day: function(w)
    {
      var lst = this.options.dayNamesShort;
      switch(w)
      {
        case 1: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Mon';
        case 2: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Tue';
        case 3: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Wed';
        case 4: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Thu';
        case 5: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Fri';
        case 6: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Sat';
        case 7: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Sun';
        default: return 'N/A';
      }
    },
    // full name of the week day
    date_name: function(w)
    {
      var lst = this.options.dayNames;
      switch(w)
      {
        case 1: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Monday';
        case 2: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Tuesday';
        case 3: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Wednesday';
        case 4: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Thursday';
        case 5: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Friday';
        case 6: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Saturday';
        case 7: return (lst != null && isArray(lst) && typeof lst[m] =='string' && lst[m] != '') ? lst[m] : 'Sunday';
        default: return 'N/A';
      }
    },
    // emit event when user clicks on a date
    selectDay: function(val)
    {
      if(this.is_disabled(val) || (val<0 && !this.select_other_month)) return;
      var d = new Date();
      if(val<0)
      {
        if(val>-10) d.setFullYear(this.cal_year, 1+this.cal_month, Math.abs(val));
          else d.setFullYear(this.cal_year, this.cal_month-1, Math.abs(val));
      }
      else d.setFullYear(this.cal_year, this.cal_month, val);
      d.setHours(0);
      d.setMinutes(0);
      d.setSeconds(0);
      d.setMilliseconds(0);
      this.$emit('onSelect',d);
    },
    is_today: function(mday)
    {
      return (this.cal_year == this.today.getFullYear() && this.cal_month == this.today.getMonth() && mday == this.today.getDate());
    },
    is_disabled: function(mday)
    {
      var d_min = this.options.minDate, d_max = this.options.maxDate, d = new Date();
      if(mday<0)
      {
        if(mday>-10) d.setFullYear(this.cal_year, 1+this.cal_month, Math.abs(mday));
        else d.setFullYear(this.cal_year, this.cal_month-1, Math.abs(mday));
      }
      else d.setFullYear(this.cal_year, this.cal_month, mday);
      d.setHours(0);
      d.setMinutes(0);
      d.setSeconds(0);
      d.setMilliseconds(0);
      if(d_max != null && this.isDate(d_max))
      {
        d_max.setHours(23);
        d_max.setMinutes(59);
        d_max.setSeconds(59);
        d_max.setMilliseconds(999);
        if(d > d_max) return true;
      }
      if(d_min != null && this.isDate(d_min))
      {
        d_min.setHours(0);
        d_min.setMinutes(0);
        d_min.setSeconds(0);
        d_min.setMilliseconds(0);
        if(d < d_min) return true;
      }
      return false;
    },
    // different CSS class for weekends
    is_weekend(dow)
    {
      switch(this.week_start)
      {
        case 1: // 1,2,3,4,5,6,7
          return (dow>5);
          break;
        case 2: // 2,3,4,5,6,7,1
          return (dow==5 || dow==6);
          break;
        case 3: // 3,4,5,6,7,1,2
          return (dow==4 || dow==5);
          break;
        case 4: // 4,5,6,7,1,2,3
          return (dow==3 || dow==4);
          break;
        case 5: // 5,6,7,1,2,3,4
          return (dow==2 || dow==3);
          break;
        case 6: // 6,7,1,2,3,4,5
          return (dow==1 || dow==2);
          break;
        case 7: // 7,1,2,3,4,5,6
          return (dow==1 || dow==7);
          break;
      }
      return false;
    },
    // determines the CSS style for a date
    // mday = day of the month (1-31)
    // dow = day of the week (1-7)
    cal_style: function(mday,dow)
    {
      // selection has higher priority
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
                    if(mday <= d2 && mday>0) return 'period';
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
                    if(mday <= d2 && mday>0) return 'period';
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
                    if(mday <= d2 && mday>0) return 'period';
                  }
                }
          }
        }
      }
      if(mday>0 && this.is_today(mday)) return 'today-cell';
      if(this.is_disabled(mday)) return 'disabled-cell';
      if(mday<0 && !this.select_other_month) return 'disabled-cell';
      return 'any-cell';
    },
    // returns array of the month dates for the given week (0-5) in the month
    // if an element is 0 - it is not shown (replaced with whitespace)
    makeWeek: function(w)
    {
      var res, other_prev = - (this.month_days_prev - (this.first_dow - 1) + 1),
        other_next = -1, max = this.month_days, day = 7*w - (this.first_dow - 1) + 1;
      if(this.show_other_month)
        res =
        [
          day   > max ? other_next-- : (day   < 1 ? other_prev-- : day),
          day+1 > max ? other_next-- : (day+1 < 1 ? other_prev-- : day+1),
          day+2 > max ? other_next-- : (day+2 < 1 ? other_prev-- : day+2),
          day+3 > max ? other_next-- : (day+3 < 1 ? other_prev-- : day+3),
          day+4 > max ? other_next-- : (day+4 < 1 ? other_prev-- : day+4),
          day+5 > max ? other_next-- : (day+5 < 1 ? other_prev-- : day+5),
          day+6 > max ? other_next-- : (day+6 < 1 ? other_prev-- : day+6),
        ];
      else
        res =
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
    // calculates the week of the year for a given week of the month
    // by default uses ISO-8601 (weeks start on Monday, 1-st week of year contains the 1-st Thursday)
    calc_week: function(w)
    {
      if(typeof this.options.calculateWeek == 'function') return this.options.calculateWeek(new Date(this.cal_year, this.cal_month, 1 + 7*w));
        else return this.moment(new Date(this.cal_year, this.cal_month, 1 + 7*w)).isoWeek();
    },
    // parse value + period (e.g. "+7d" or "-3w")
    relDate: function(val)
    {
      var i, duration, d = this.moment(), t = val.match(/0|[+\-]\d+[dmwy]/ig);
      if(t != null && t.length) for(i=0; i<t.length; i++)
      {
        if(t[i]=="0") continue;
        let x = t[i].match(/([+\-]\d+)([dmwy])/);
        if(x != null && x.length == 3)
        {
          duration = parseInt(x[1]);
          if(isNaN(duration)) continue;
          if(duration < 0) d = d.subtract(duration,x[2]);
          else d = d.add(duration,x[2]);
        }
      }
      return d.toDate();
    },
    isDate: function(d)
    {
      return Object.prototype.toString.call(d) === '[object Date]';
    },
    isArray: function(a)
    {
      return Object.prototype.toString.call(a) === '[object Array]';
    },
    doPrev: function()
    {
      if(!this.first_month) this.$emit('onPrev');
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

td.calendar-weeks
{
  text-align: center;
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
