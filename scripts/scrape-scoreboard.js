module.exports = function scrapeScoreboard(week) {
  var matchupEls = document.querySelectorAll('.matchup');
  var matchups = [];
  var summary = `@here: *Week ${week} results*\n\n\n\n`;
  var fantasyKing;
  var fantasyBitch;
  var verbs = ['punishes', 'crushes', 'walks all over', 'destroys', 'embarasses', 'painals', 'opens a can of whoop ass', 'pummels', 'curb stomps', 'works over', 'cruises by', 'easily handles', 'mops the floor with', 'crucifies', 'knocks off'];

  function getTeam(row) {
    if(typeof row === 'undefined' || !row.querySelector('.name')) return;

    return {
      name: row.querySelector('.name > a').innerHTML,
      owner: row.querySelector('.owners').innerHTML.replace(/\b[a-z]/g, function(f) { return f.toUpperCase(); }),
      score: parseInt(row.querySelector('.score').innerHTML, 10)
    };
  }

  matchupEls.forEach(function(el, i) {
    var matchup = {};
    var rows = el.querySelectorAll('tr');
    var mvpScores = el.querySelector('.scoringDetails');

    matchup.team1 = getTeam(rows[0]);
    matchup.team2 = getTeam(rows[1]);

    const topScorers = mvpScores.querySelectorAll('[id^="team_topscorer"]');

    matchup.team1.topScorer = topScorers[0].textContent;
    matchup.team2.topScorer = topScorers[1].textContent;

    matchups.push(matchup);
  });

  matchups.forEach(function(m, i) {
    if(typeof m.team1 === undefined || typeof m.team2 === undefined) return;

    var winner = m.team1;
    var loser = m.team2;
    var verb = 'beats';

    if(m.team2.score > m.team1.score) {
      winner = m.team2;
      loser = m.team1;
    }

    if(winner.score - loser.score >= 10) verb = verbs[Math.floor(Math.random() * verbs.length)];

    if(!fantasyKing || (winner.score > fantasyKing.score)) {
      fantasyKing = winner;
    }

    if(!fantasyBitch || (loser.score < fantasyBitch.score)) {
      fantasyBitch = loser;
    }

    summary += `*${winner.name} (${winner.owner})* ${verb} *${loser.name} (${loser.owner})*  - ${winner.score} to ${loser.score} \n\n`;
    summary += `*${winner.name}'s MVP:* ${winner.topScorer}\n`;
    summary += `*${loser.name}'s MVP:* ${loser.topScorer}\n\n`;
    summary += '===============================================\n\n';
  });

  summary += '\n\n';
  summary += `:crown: This Week's Fantasy King: *${fantasyKing.name} (${fantasyKing.owner})* - ${fantasyKing.score}\n`;
  summary += `:eggplant: This Week's Fantasy Biatch: *${fantasyBitch.name} (${fantasyBitch.owner})* - ${fantasyBitch.score}\n`;

  return summary;
}