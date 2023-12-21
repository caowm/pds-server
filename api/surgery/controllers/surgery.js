'use strict';
const moment = require('moment');

function getSurgeryDB() {
  return strapi.connections.surgery;
}

module.exports = {

  /*


declare @now datetime = '2022-08-20 22:50:00'

-- 正在进行以及刚刚结束的手术
select
	c.ss_room, max(rssj) as rssj
from
	pat_mzjld_master_tab d
	join ssmz_ssyy c on c.pat_id = d.pat_id and right(c.ssmz_number,1) = d.xh
where d.rssj <= @now and d.rssj > DATEADD(hour, -8, @now)
		and (d.ssjssj is null or d.ssjssj > DATEADD(minute, -10, @now))
group by c.ss_room


select
	p.pat_id, p.pat_name, p.pat_num, c.ssmz_number,
	c.ss_room, c.ss_doctor, t.dept_name, c.ssbm_name, d.rssj, d.ssjssj,
	case when d.ssjssj < @now then 'finished' else 'going' end as status
from
	pat_mzjld_master_tab d
	join patient_info_tab p on d.pat_id = p.pat_id
	join ssmz_ssyy c on c.pat_id = d.pat_id and right(c.ssmz_number,1) = d.xh
	join (
		select
			c.ss_room, max(rssj) as rssj
		from
			pat_mzjld_master_tab d
			join ssmz_ssyy c on c.pat_id = d.pat_id and right(c.ssmz_number,1) = d.xh
		where d.rssj <= @now and d.rssj > DATEADD(hour, -8, @now)
				and (d.ssjssj is null or d.ssjssj > DATEADD(minute, -15, @now))
		group by c.ss_room
	) f on c.ss_room = f.ss_room and d.rssj = f.rssj
	left join sys_dept_tab t on t.dept_code = c.dept_code
order by d.rssj


-- 未来12小时即将到来的手术
select
	p.pat_id, p.pat_name, p.pat_num, c.ssmz_number,
	c.ss_room, c.ss_doctor, t.dept_name, c.ssbm_name, c.plan_time, null as ssjssj,
	'coming' as status
from ssmz_ssyy c
	join (
		select c.ss_room, min(c.plan_time) as plan_time
		from ssmz_ssyy c
		where c.plan_time > @now and c.plan_time < DATEADD(hour, 12, @now)
		group by c.ss_room
	) b on c.plan_time = b.plan_time and c.ss_room = b.ss_room
	join patient_info_tab p on c.pat_id = p.pat_id
	left join sys_dept_tab t on t.dept_code = c.dept_code
order by c.plan_time

   */
  // 手术室概览
	async roomsOverview(ctx) {
    const knex = getSurgeryDB();
	  let now = ctx.query.time || moment().format('YYYY-MM-DD HH:mm:ss');
	  // console.log(ctx.params, ctx.query, now);

    // 手术间列表
    const rooms = await knex.raw('select room, code as device_code, name, status from device with (nolock) order by room');

    // 正在进行的手术
    let going = await knex.raw(
      "select\n" +
      "  p.pat_id, p.pat_name, p.pat_num, c.ssmz_number, c.bed_code, c.toxi_kind, \n" +
      "  p.pat_sex,  datediff(year, p.pat_birthday, getdate()) as years_old, " +
      "  c.ss_room, c.ss_doctor, t.dept_name, c.ssbm_name, d.mzys, d.rssj, d.mzkssj, d.sskssj, d.ssjssj,\n" +
      "  case when d.ssjssj < ? then 'finished' else 'going' end as status\n" +
      "from\n" +
      "  pat_mzjld_master_tab d with (nolock)\n" +
      "  join patient_info_tab p with (nolock) on d.pat_id = p.pat_id\n" +
      "  join ssmz_ssyy c with (nolock) on c.pat_id = d.pat_id and right(c.ssmz_number,1) = d.xh\n" +
      "  join (\n" +
      "    select\n" +
      "      c.ss_room, max(rssj) as rssj\n" +
      "    from\n" +
      "      pat_mzjld_master_tab d with (nolock) \n" +
      "      join ssmz_ssyy c  with (nolock) on c.pat_id = d.pat_id and right(c.ssmz_number,1) = d.xh\n" +
      "    where d.rssj <= ? and d.rssj > DATEADD(hour, -8, ?)\n" +
      "        and (d.ssjssj is null or d.ssjssj > DATEADD(minute, -15, ?))\n" +
      "    group by c.ss_room\n" +
      "  ) f on c.ss_room = f.ss_room and d.rssj = f.rssj\n" +
      "  left join sys_dept_tab t with (nolock) on t.dept_code = c.dept_code\n" +
      "order by d.rssj",
      [now, now, now, now]);

    // 将来12小时内的手术
    let coming = await knex.raw(
      "select\n" +
      "  p.pat_id, p.pat_name, p.pat_num, c.ssmz_number, c.bed_code, c.toxi_kind, \n" +
      "  p.pat_sex, datediff(year, p.pat_birthday, getdate()) as years_old, " +
      "  c.ss_room, c.ss_doctor, t.dept_name, c.ssbm_name, null as mzys, c.plan_time as rssj, \n" +
      " null as mzkssj, null as sskssj, null as ssjssj, \n" +
      "  'coming' as status\n" +
      "from ssmz_ssyy c with (nolock) \n" +
      "  join (\n" +
      "    select c.ss_room, min(c.plan_time) as plan_time\n" +
      "    from ssmz_ssyy c with (nolock)\n" +
      "    where c.plan_time > ? and c.plan_time < DATEADD(hour, 12, ?)\n" +
      "    group by c.ss_room\n" +
      "  ) b on c.plan_time = b.plan_time and c.ss_room = b.ss_room\n" +
      "  join patient_info_tab p with (nolock) on c.pat_id = p.pat_id\n" +
      "  left join sys_dept_tab t with (nolock) on t.dept_code = c.dept_code\n",
      [now, now]);

    return {rooms, going, coming};
  },

  // 手术室详情
  async getDetail(ctx) {
    const knex = getSurgeryDB();
    let now = moment().format('YYYY-MM-DD HH:mm:ss');
    const room = ctx.query.room;
    let ssmz_number = ctx.query.number || '';

    if (!ssmz_number) {
      const temp = await knex.raw(
        "select c.ssmz_number\n" +
        "from pat_mzjld_master_tab d with (nolock) \n" +
        "  join ssmz_ssyy c with (nolock) on c.pat_id = d.pat_id and right(c.ssmz_number,1) = d.xh\n" +
        "where c.ss_room = ? and d.rssj = (\n" +
        "  select max(rssj) as rssj\n" +
        "  from pat_mzjld_master_tab d with (nolock) \n" +
        "    join ssmz_ssyy c with (nolock) on c.pat_id = d.pat_id and right(c.ssmz_number,1) = d.xh\n" +
        "  where c.ss_room = ?\n" +
        "    and d.rssj <= ? and d.rssj > DATEADD(hour, -8, ?)\n" +
        "    and (d.ssjssj is null or d.ssjssj > DATEADD(minute, 10, ?))\n" +
        "  )",
        [room, room, now, now, now])
      if (temp.length > 0) ssmz_number = temp[0].ssmz_number
    }

    const detail = await knex.raw(
      "select\n" +
      "  p.pat_id, p.pat_name, p.pat_num, c.ssmz_number, c.bed_code, p.pat_in_diagnosis, c.toxi_kind, \n" +
      "  p.pat_sex, datediff(year, p.pat_birthday, getdate()) as years_old, d.mzys, d.mzff, d.mzkssj, d.sskssj, \n" +
      "  c.ss_room, c.ss_doctor, t.dept_name, c.ssbm_name, c.plan_time, d.rssj, d.ssjssj, d.mzjssj \n" +
      "from ssmz_ssyy c with (nolock) \n" +
      "  join patient_info_tab p with (nolock) on c.pat_id = p.pat_id\n" +
      "  left join pat_mzjld_master_tab d with (nolock) on d.pat_id = c.pat_id and d.xh = right(c.ssmz_number,1) \n" +
      "  left join sys_dept_tab t with (nolock) on t.dept_code = c.dept_code\n" +
      "where c.ssmz_number = ? ",
      [ssmz_number]);

    return detail.length > 0 ? detail[0] : {};
  },

  // 手术室监护仪数据
  async deviceData(ctx) {
    const knex = getSurgeryDB();
    const room_id = ctx.params.id;
    // 没有指定时间则默认最近一小时数据
    let begin_time = ctx.query.begin || moment().subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss');
    let end_time = ctx.query.end || moment().format('YYYY-MM-DD HH:mm:ss');      // 当前时间
    // console.log(room_id, begin_time, end_time)

    // const device = await knex('device').where('room', room_id).select('room', 'code');
    // if (device.length === 0) return []

    // const data = await knex.raw(
    //   'select top 5000 record_time as [time], [key], value from device_data with (nolock) \n' +
    //   'where device_code = ? and record_time >= ? and record_time <= ? ',
    //   [device[0].code, begin_time, end_time]);
    const data = await knex.raw(
      'select top 5000 jssj as time, xmdh as [key], xmjg as value from ssmz_yqdata with (nolock) \n' +
      'where room = ? and jssj >= ? and jssj <= ?  order by jssj',
      [room_id, begin_time, end_time]);
    return data;
  },

  // 查询麻醉事件
  async getEvent(ctx) {
    const knex = getSurgeryDB();
    const ssmz_number = ctx.query.number || "";
    if (!ssmz_number) return [];
    const pat_id = ssmz_number.substr(0, ssmz_number.length - 1);
    const xh = Number(ssmz_number.substr(ssmz_number.length - 1));
    // console.log(pat_id, xh);
    const event = await knex.raw(
      'select * from pat_mzjld_yyczmx_tab with (nolock) where pat_id=? and xh=? order by sqsj ',
      [pat_id, xh]);
    return event;
  },

  // 按月统计手术
  async statMonth(ctx) {
    const knex = getSurgeryDB();
    let begin_time = moment().subtract(1, 'years').startOf('month').format('YYYY-MM-DD HH:mm:ss');
    let end_time = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');
    const result = await knex.raw(
      ' select CONVERT(varchar(7), plan_time, 120) AS month, count(*) as cnt' +
      ' from ssmz_ssyy with (nolock) ' +
      ' where plan_time >= ?  and plan_time <= ? ' +
      ' group by CONVERT(varchar(7), plan_time, 120)',
      [begin_time, end_time]);
    return result;
  },

  // 按科室统计手术
  async statOffice(ctx) {
    const knex = getSurgeryDB();
    let begin_time = moment().subtract(1, 'years').startOf('month').format('YYYY-MM-DD HH:mm:ss');
    let end_time = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');
    const result = await knex.raw(
      ' select b.dept_name, a.cnt from (' +
      ' select dept_code, count(*) as cnt ' +
      ' from ssmz_ssyy with (nolock) ' +
      ' where plan_time >= ? and plan_time <= ? ' +
      ' group by dept_code) a join sys_dept_tab b on a.dept_code = b.dept_code ' +
      ' order by a.cnt ',
      [begin_time, end_time]) ;
    return result;
  },

};
