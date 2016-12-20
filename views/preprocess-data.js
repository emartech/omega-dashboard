'use strict';

const cloneDeep = require('clone-deep');
const _ = require('lodash');

module.exports = function preprocess(data) {
  data = countEpics(data);

  const clonedData = cloneDeep(data);
  clonedData.cycle.epics = getGlobalSummary(data);
  clonedData.cycle.time = getTimeSummary(data.cycle);
  clonedData.clan_statuses.forEach(addSummaryToClan);
  return clonedData;
};

function countEpics(data) {
  return Object.assign(data, {
    clan_statuses: data.clan_statuses.map(clan_status => Object.assign(clan_status, {
      projects: clan_status.projects.map(project => Object.assign(project, {
        epics: !Array.isArray(project.epics) ? project.epics : {
          done: project.epics.filter(epic => epic.status === 'done').length,
          all: project.epics.length
        }
      }))
    }))
  });
}

function getGlobalSummary(data) {
  return {
    done: _(data.clan_statuses)
            .map(clan => clan.projects)
            .flatten()
            .map(project => project.epics.done)
            .sum(),
    all: _(data.clan_statuses)
            .map(clan => clan.projects)
            .flatten()
            .map(project => project.epics.all)
            .sum()
  };
}

function addSummaryToClan(clan) {
  clan.epics = {
    done: _(clan.projects)
            .map(project => project.epics.done)
            .sum(),
    all: _(clan.projects)
            .map(project => project.epics.all)
            .sum()
  };
}

function getTimeSummary(cycle) {
  const start = new Date(cycle.start);
  const end = new Date(cycle.end);
  const today = new Date();
  return {
    total_days: intervalInDays(start, end),
    elapsed_days: intervalInDays(start, today)
  };
}

function intervalInDays(start, end) {
  const timestampDiff = end.getTime() - start.getTime();
  const millisecsInDay = 24 * 60 * 60 * 1000;
  const differenceInDays = Math.floor(timestampDiff / millisecsInDay);
  return differenceInDays;
}
