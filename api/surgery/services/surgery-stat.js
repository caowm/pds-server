
const moment = require('moment');

function surgeryDB() {
  return strapi.connections.surgery
}

async function removeData(table, year, month) {
  const knex = surgeryDB()
  await knex.raw(
    ' delete from stat_data where [table]=? and [year]=? and [month]=?',
    [table, year, month])
}

/*
手麻质控查询

select a.an_name_en as [group], a.an_name as name, b.*
from data_tree_tab a, (
	select b.an_code,
		sum(case when month(a.emr_date)=1 and b.an_descript = '是' then 1 else 0 end) as m1,
		sum(case when month(a.emr_date)=2 and b.an_descript = '是' then 1 else 0 end) as m2,
		sum(case when month(a.emr_date)=3 and b.an_descript = '是' then 1 else 0 end) as m3,
		sum(case when month(a.emr_date)=4 and b.an_descript = '是' then 1 else 0 end) as m4,
		sum(case when month(a.emr_date)=5 and b.an_descript = '是' then 1 else 0 end) as m5,
		sum(case when month(a.emr_date)=6 and b.an_descript = '是' then 1 else 0 end) as m6,
		sum(case when month(a.emr_date)=7 and b.an_descript = '是' then 1 else 0 end) as m7,
		sum(case when month(a.emr_date)=8 and b.an_descript = '是' then 1 else 0 end) as m8,
		sum(case when month(a.emr_date)=9 and b.an_descript = '是' then 1 else 0 end) as m9,
		sum(case when month(a.emr_date)=10 and b.an_descript = '是' then 1 else 0 end) as m10,
		sum(case when month(a.emr_date)=11 and b.an_descript = '是' then 1 else 0 end) as m11,
		sum(case when month(a.emr_date)=12 and b.an_descript = '是' then 1 else 0 end) as m12
	from pat_recoder_tab a join recoder_data_tab b on a.pat_id = b.pat_id and a.emr_code = b.emr_code and a.recoder_sn = b.recoder_sn
		join data_tree_tab c on c.an_emrcode = b.emr_code and c.an_code = b.an_code and c.an_code > '0116'
	where a.emr_code = 'EMR050124' and  a.emr_date > '2022-08-01'
	group by b.an_code
) b
where a.an_emrcode = 'EMR050124' and a.an_code = b.an_code
order by a.an_sort

union all


union all



*/
async function queryWorkQuality(year) {
  const emr_code = 'EMR050124'
  const knex = surgeryDB()
  const startTime = moment([year, 1, 1]).format('YYYY-MM-DD')
  const endTime = moment([year+1, 1, 1]).add(1, "months").format('YYYY-MM-DD')

  let data1 = await knex.raw(
    "  select '麻醉科完成麻醉总例数' as [group], '' as name, \n" +
    "    sum(case when month(a.rssj)=1  then 1 else 0 end) as m1,\n" +
    "    sum(case when month(a.rssj)=2  then 1 else 0 end) as m2,\n" +
    "    sum(case when month(a.rssj)=3  then 1 else 0 end) as m3,\n" +
    "    sum(case when month(a.rssj)=4  then 1 else 0 end) as m4,\n" +
    "    sum(case when month(a.rssj)=5  then 1 else 0 end) as m5,\n" +
    "    sum(case when month(a.rssj)=6  then 1 else 0 end) as m6,\n" +
    "    sum(case when month(a.rssj)=7  then 1 else 0 end) as m7,\n" +
    "    sum(case when month(a.rssj)=8  then 1 else 0 end) as m8,\n" +
    "    sum(case when month(a.rssj)=9  then 1 else 0 end) as m9,\n" +
    "    sum(case when month(a.rssj)=10 then 1 else 0 end) as m10,\n" +
    "    sum(case when month(a.rssj)=11 then 1 else 0 end) as m11,\n" +
    "    sum(case when month(a.rssj)=12 then 1 else 0 end) as m12\n" +
    "  from pat_mzjld_master_tab a \n" +
    "  where a.rssj >= ? and a.rssj < ? and a.mzff <> '无麻醉' \n",
    [startTime, endTime])

  let data2 = await knex.raw(
    "  select '急诊非择期例数' as [group], '' as name, \n" +
    "    sum(case when month(a.rssj)=1  then 1 else 0 end) as m1,\n" +
    "    sum(case when month(a.rssj)=2  then 1 else 0 end) as m2,\n" +
    "    sum(case when month(a.rssj)=3  then 1 else 0 end) as m3,\n" +
    "    sum(case when month(a.rssj)=4  then 1 else 0 end) as m4,\n" +
    "    sum(case when month(a.rssj)=5  then 1 else 0 end) as m5,\n" +
    "    sum(case when month(a.rssj)=6  then 1 else 0 end) as m6,\n" +
    "    sum(case when month(a.rssj)=7  then 1 else 0 end) as m7,\n" +
    "    sum(case when month(a.rssj)=8  then 1 else 0 end) as m8,\n" +
    "    sum(case when month(a.rssj)=9  then 1 else 0 end) as m9,\n" +
    "    sum(case when month(a.rssj)=10 then 1 else 0 end) as m10,\n" +
    "    sum(case when month(a.rssj)=11 then 1 else 0 end) as m11,\n" +
    "    sum(case when month(a.rssj)=12 then 1 else 0 end) as m12\n" +
    "  from pat_mzjld_master_tab a \n" +
    "  where a.rssj >= ? and a.rssj < ? and isnull(a.jz_zq, '') = '' \n",
    [startTime, endTime])

  let data3 = await knex.raw(
    "select a.an_name_en as [group], a.an_snomed as name, " +
    "  isnull(b.m1, 0) as m1, isnull(b.m2, 0) as m2, isnull(b.m3, 0) as m3, isnull(b.m4, 0) as m4, \n" +
    "  isnull(b.m5, 0) as m5, isnull(b.m6, 0) as m6, isnull(b.m7, 0) as m7, isnull(b.m8, 0) as m8, \n" +
    "  isnull(b.m9, 0) as m9, isnull(b.m10, 0) as m10, isnull(b.m11, 0) as m11, isnull(b.m12, 0) as m12 \n" +
    "from data_tree_tab a left join (\n" +
    "  select b.an_code,\n" +
    "    sum(case when month(a.rssj)=1  then 1 else 0 end) as m1,\n" +
    "    sum(case when month(a.rssj)=2  then 1 else 0 end) as m2,\n" +
    "    sum(case when month(a.rssj)=3  then 1 else 0 end) as m3,\n" +
    "    sum(case when month(a.rssj)=4  then 1 else 0 end) as m4,\n" +
    "    sum(case when month(a.rssj)=5  then 1 else 0 end) as m5,\n" +
    "    sum(case when month(a.rssj)=6  then 1 else 0 end) as m6,\n" +
    "    sum(case when month(a.rssj)=7  then 1 else 0 end) as m7,\n" +
    "    sum(case when month(a.rssj)=8  then 1 else 0 end) as m8,\n" +
    "    sum(case when month(a.rssj)=9  then 1 else 0 end) as m9,\n" +
    "    sum(case when month(a.rssj)=10  then 1 else 0 end) as m10,\n" +
    "    sum(case when month(a.rssj)=11  then 1 else 0 end) as m11,\n" +
    "    sum(case when month(a.rssj)=12  then 1 else 0 end) as m12\n" +
    "  from pat_mzjld_master_tab a join recoder_data_tab b on a.pat_id = b.pat_id \n" +
    "  where a.rssj >= ? and a.rssj < ? and b.emr_code = ? and b.an_code > '0116' and b.an_descript = '是' \n" +
    "  group by b.an_code \n" +
    ") b on a.an_code = b.an_code \n" +
    "where a.an_emrcode = ? and isnull(a.an_name_en, '') <> '' \n" +
    "order by a.an_sort",
    [startTime, endTime, emr_code, emr_code])

  return [].concat(data1, await queryWorkAsa(year), data2, await queryWorkAnesthMethod(year), data3)
}

async function queryWorkOffice(year) {
  const knex = surgeryDB()
  const startTime = moment([year, 1, 1]).format('YYYY-MM-DD')
  const endTime = moment([year+1, 1, 1]).add(1, "months").format('YYYY-MM-DD')
  const data = await knex.raw(
    "select b.dept_code as code, b.dept_name as name, \n" +
    "  sum(case when month(a.rssj)=1 then 1 else 0 end) as m1,\n" +
    "  sum(case when month(a.rssj)=2 then 1 else 0 end) as m2,\n" +
    "  sum(case when month(a.rssj)=3 then 1 else 0 end) as m3,\n" +
    "  sum(case when month(a.rssj)=4 then 1 else 0 end) as m4,\n" +
    "  sum(case when month(a.rssj)=5 then 1 else 0 end) as m5,\n" +
    "  sum(case when month(a.rssj)=6 then 1 else 0 end) as m6,\n" +
    "  sum(case when month(a.rssj)=7 then 1 else 0 end) as m7,\n" +
    "  sum(case when month(a.rssj)=8 then 1 else 0 end) as m8,\n" +
    "  sum(case when month(a.rssj)=9 then 1 else 0 end) as m9,\n" +
    "  sum(case when month(a.rssj)=10 then 1 else 0 end) as m10,\n" +
    "  sum(case when month(a.rssj)=11 then 1 else 0 end) as m11,\n" +
    "  sum(case when month(a.rssj)=12 then 1 else 0 end) as m12,\n" +
    "  count(1) as total\n" +
    "from pat_mzjld_master_tab a with (nolock) join sys_dept_tab b with (nolock) on a.pat_department = b.dept_code \n" +
    "where a.rssj >= ? and a.rssj < ? \n" +
    "group by b.dept_code, b.dept_name \n",
    [startTime, endTime]
  )
  return data
}

// async function buildWorkOffice(year, month) {
//   const knex = surgeryDB();
//   await removeData('WorkOffice', year, month);
//   const startTime = moment([year, month, 1]).format('YYYY-MM-DD')
//   const endTime = moment([year, month, 1]).add(1, "months").format('YYYY-MM-DD')
//   await knex.raw(
//     "insert into stat_data ([year], [month], [table], category, code, name, value) \n" +
//     "select ? as [year], ? as [month], 'WorkOffice' as [table], '' as category, " +
//     "    a.dept_code as code, b.dept_name as name, count(1) as value \n" +
//     "from ssmz_ssyy a with (nolock) join sys_dept_tab b with (nolock) on a.dept_code = b.dept_code \n" +
//     "where a.operate_time >= ? and a.operate_time < ? \n" +
//     "group by a.dept_code, b.dept_name \n",
//     [year, month, startTime, endTime]
//   )
//   return
// }

async function queryWorkAnesthMethod(year, month) {
  const knex = surgeryDB()
  const startTime = moment([year, 1, 1]).format('YYYY-MM-DD')
  const endTime = moment([year+1, 1, 1]).add(1, "months").format('YYYY-MM-DD')
  const data = await knex.raw(
    "select '麻醉方式' as [group], a.mzff as name, \n" +
    "  sum(case when month(a.rssj)=1 then 1 else 0 end) as m1,\n" +
    "  sum(case when month(a.rssj)=2 then 1 else 0 end) as m2,\n" +
    "  sum(case when month(a.rssj)=3 then 1 else 0 end) as m3,\n" +
    "  sum(case when month(a.rssj)=4 then 1 else 0 end) as m4,\n" +
    "  sum(case when month(a.rssj)=5 then 1 else 0 end) as m5,\n" +
    "  sum(case when month(a.rssj)=6 then 1 else 0 end) as m6,\n" +
    "  sum(case when month(a.rssj)=7 then 1 else 0 end) as m7,\n" +
    "  sum(case when month(a.rssj)=8 then 1 else 0 end) as m8,\n" +
    "  sum(case when month(a.rssj)=9 then 1 else 0 end) as m9,\n" +
    "  sum(case when month(a.rssj)=10 then 1 else 0 end) as m10,\n" +
    "  sum(case when month(a.rssj)=11 then 1 else 0 end) as m11,\n" +
    "  sum(case when month(a.rssj)=12 then 1 else 0 end) as m12,\n" +
    "  count(1) as total\n" +
    "from pat_mzjld_master_tab a with (nolock) \n" +
    "where a.rssj >= ? and a.rssj < ? \n" +
    "group by a.mzff",
    [startTime, endTime]
  )
  return data
}

async function queryWorkAsa(year, month) {
  const knex = surgeryDB()
  const startTime = moment([year, 1, 1]).format('YYYY-MM-DD')
  const endTime = moment([year+1, 1, 1]).add(1, "months").format('YYYY-MM-DD')
  const data = await knex.raw(
    "select 'ASA分级' as [group], asafj as name, \n" +
    "  sum(case when month(a.rssj)=1 then 1 else 0 end) as m1,\n" +
    "  sum(case when month(a.rssj)=2 then 1 else 0 end) as m2,\n" +
    "  sum(case when month(a.rssj)=3 then 1 else 0 end) as m3,\n" +
    "  sum(case when month(a.rssj)=4 then 1 else 0 end) as m4,\n" +
    "  sum(case when month(a.rssj)=5 then 1 else 0 end) as m5,\n" +
    "  sum(case when month(a.rssj)=6 then 1 else 0 end) as m6,\n" +
    "  sum(case when month(a.rssj)=7 then 1 else 0 end) as m7,\n" +
    "  sum(case when month(a.rssj)=8 then 1 else 0 end) as m8,\n" +
    "  sum(case when month(a.rssj)=9 then 1 else 0 end) as m9,\n" +
    "  sum(case when month(a.rssj)=10 then 1 else 0 end) as m10,\n" +
    "  sum(case when month(a.rssj)=11 then 1 else 0 end) as m11,\n" +
    "  sum(case when month(a.rssj)=12 then 1 else 0 end) as m12,\n" +
    "  count(1) as total\n" +
    "from pat_mzjld_master_tab a with (nolock) \n" +
    "where a.rssj >= ? and a.rssj < ? \n" +
    "group by a.asafj",
    [startTime, endTime]
  )
  return data
}


async function queryWorkAnesthResult(year, month) {
  const knex = surgeryDB()
  const startTime = moment([year, 1, 1]).format('YYYY-MM-DD')
  const endTime = moment([year+1, 1, 1]).add(1, "months").format('YYYY-MM-DD')
  const data = await knex.raw(
    "select a.mzfj as name, \n" +
    "  sum(case when month(a.rssj)=1 then 1 else 0 end) as m1,\n" +
    "  sum(case when month(a.rssj)=2 then 1 else 0 end) as m2,\n" +
    "  sum(case when month(a.rssj)=3 then 1 else 0 end) as m3,\n" +
    "  sum(case when month(a.rssj)=4 then 1 else 0 end) as m4,\n" +
    "  sum(case when month(a.rssj)=5 then 1 else 0 end) as m5,\n" +
    "  sum(case when month(a.rssj)=6 then 1 else 0 end) as m6,\n" +
    "  sum(case when month(a.rssj)=7 then 1 else 0 end) as m7,\n" +
    "  sum(case when month(a.rssj)=8 then 1 else 0 end) as m8,\n" +
    "  sum(case when month(a.rssj)=9 then 1 else 0 end) as m9,\n" +
    "  sum(case when month(a.rssj)=10 then 1 else 0 end) as m10,\n" +
    "  sum(case when month(a.rssj)=11 then 1 else 0 end) as m11,\n" +
    "  sum(case when month(a.rssj)=12 then 1 else 0 end) as m12,\n" +
    "  count(1) as total\n" +
    "from pat_mzjld_master_tab a with (nolock) \n" +
    "where a.rssj >= ? and a.rssj < ? \n" +
    "group by a.mzfj",
    [startTime, endTime]
  )
  return data
}


async function queryWorkAnesthDoctor(year, month) {
  const knex = surgeryDB()
  const startTime = moment([year, month-1, 1]).format('YYYY-MM-DD')
  const endTime = moment([year, month-1, 1]).add(1, "months").format('YYYY-MM-DD')

  const data = await knex.raw(
    "select b.user_id, b.user_name, count(1) as total, \n" +
    "    sum(isnull(datediff(minute, a.mzkssj, a.mzjssj), 0)) as duration, \n" +
    "    sum(case when a.jz_zq='急诊' then 1 else 0 end) as jizheng, \n" +
    "    sum(case when a.mzff='全麻' and cg is not null then 1 else 0 end) as anesth_qm_cg, \n" +
    "    sum(case when a.mzff='全麻' and cg is null then 1 else 0 end) as anesth_qm_ncg, \n" +
    "    sum(case when a.mzff='腰硬联合' then 1 else 0 end) as anesth_yylh, \n" +
    "    sum(case when a.mzff='连硬麻' then 1 else 0 end) as anesth_lym, \n" +
    "    sum(case when a.mzff='腰麻' then 1 else 0 end) as anesth_ym, \n" +
    "    sum(case when a.mzff='神经阻滞' then 1 else 0 end) as anesth_sjzz, \n" +
    "    sum(case when a.mzff='局麻' then 1 else 0 end) as anesth_jm, \n" +
    "    sum(case when a.asafj='Ⅰ' then 1 else 0 end) as asa_1, \n" +
    "    sum(case when a.asafj='Ⅱ' then 1 else 0 end) as asa_2, \n" +
    "    sum(case when a.asafj='Ⅲ' then 1 else 0 end) as asa_3, \n" +
    "    sum(case when a.asafj='Ⅳ' then 1 else 0 end) as asa_4, \n" +
    "    sum(case when a.asafj='Ⅴ' then 1 else 0 end) as asa_5, \n" +
    "    sum(case when a.mzfj='Ⅰ' then 1 else 0 end) as anesth_1, \n" +
    "    sum(case when a.mzfj='Ⅱ' then 1 else 0 end) as anesth_2, \n" +
    "    sum(case when a.mzfj='Ⅲ' then 1 else 0 end) as anesth_3, \n" +
    "    sum(case when a.mzfj='Ⅳ' then 1 else 0 end) as anesth_4 \n" +
    "from \n" +
    "  (select m.mzkssj, m.mzjssj, m.mzys, m.asafj, m.mzff, m.mzfj, m.jz_zq, (select top 1 yymc \n " +
    "    from pat_mzjld_yyczmx_tab t with (nolock) where t.pat_id=m.pat_id and t.xh=m.xh and t.czlb='6') as cg \n" +
    "  from pat_mzjld_master_tab m with (nolock) where m.rssj >= ? and m.rssj < ?) a \n" +
    "join sys_user_tab b with (nolock) on charindex(b.user_name, a.mzys) > 0 and b.user_type = '1' \n" +
    "group by b.user_id, b.user_name \n",
    [startTime, endTime]
  )
  return data
}

async function queryWorkNurse(year, month) {
  const knex = surgeryDB()
  const startTime = moment([year, month-1, 1]).format('YYYY-MM-DD')
  const endTime = moment([year, month-1, 1]).add(1, "months").format('YYYY-MM-DD')

  const data = await knex.raw(
    "select b.user_id, b.user_name, \n" +
    "  sum(case when a.xishou_nurse = b.user_id then 1 else 0 end) as xishou, \n" +
    "  sum(case when a.xunhui_nurse = b.user_id then 1 else 0 end) as xunhui,\n" +
    "  sum(isnull(datediff(minute, t.sskssj, t.ssjssj), 0)) as duration\n" +
    "from pat_mzjld_master_tab t with (nolock) \n" +
    "  join ssmz_ssyy a with (nolock) on a.ssmz_number = t.pat_id + cast(t.xh as varchar(5))\n" +
    "  join sys_user_tab b with (nolock) on a.xishou_nurse = b.user_id or a.xunhui_nurse = b.user_id\n" +
    "where t.rssj >= ? and t.rssj < ?\n" +
    "group by b.user_id, b.user_name",
    [startTime, endTime]
  )
  return data
}

async function queryWorkNurseDetail(year, month, query) {
  const knex = surgeryDB()
  const startTime = moment([year, month-1, 1]).format('YYYY-MM-DD')
  const endTime = moment([year, month-1, 1]).add(1, "months").format('YYYY-MM-DD')

  const data = await knex.raw(
    "select convert(varchar(10), t.rssj, 120) as [date], b.user_id, b.user_name, \n" +
    "  sum(case when a.xishou_nurse = b.user_id then 1 else 0 end) as xishou, \n" +
    "  sum(case when a.xunhui_nurse = b.user_id then 1 else 0 end) as xunhui,\n" +
    "  sum(isnull(datediff(minute, t.sskssj, t.ssjssj), 0)) as duration\n" +
    "from pat_mzjld_master_tab t with (nolock) \n" +
    "  join ssmz_ssyy a with (nolock) on a.ssmz_number = t.pat_id + cast(t.xh as varchar(5))\n" +
    "  join sys_user_tab b with (nolock) on a.xishou_nurse = b.user_id or a.xunhui_nurse = b.user_id\n" +
    "where t.rssj >= ? and t.rssj < ? and b.user_id = ? \n" +
    "group by convert(varchar(10), t.rssj, 120), b.user_id, b.user_name",
    [startTime, endTime, query.user]
  )
  return data
}

module.exports = {
  queryWorkOffice,
  queryWorkAnesthMethod,
  queryWorkAsa,
  queryWorkAnesthResult,
  queryWorkAnesthDoctor,
  queryWorkNurse,
  queryWorkNurseDetail,
  queryWorkQuality
}
