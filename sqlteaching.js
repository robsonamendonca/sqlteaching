var sql = window.SQL;
// The db variable gets set every time a level is loaded.
var db;

// Return an HTML table as a string, given SQL.js results
var table_from_results = function(res) {
  var table_string = '<table>';
  if (res) {
    table_string += '<tr>';
    for (var index in res[0].columns) {
      table_string += '<th>' + res[0].columns[index] + '</th>';
    }
    table_string += '</tr>';
    for (var row_index in res[0].values) {
      table_string += '<tr>';
      for (var col_index in res[0].values[row_index]) {
        table_string += '<td>' + res[0].values[row_index][col_index] + '</td>';
      }
      table_string += '</tr>';
    }
  }
  table_string += '</table>';
  return table_string;
};

var grade_results = function(results, correct_answer) {
  if (!results) {
    return false;
  }

  return JSON.stringify(results[0].columns) == JSON.stringify(correct_answer.columns) &&
    JSON.stringify(results[0].values) == JSON.stringify(correct_answer.values);
}

var show_is_correct = function(is_correct) {
  if (is_correct) {
    is_correct_html = 'Congrats!  That is correct!<br/>';
    if (current_level < levels.length) {
      is_correct_html += '<a href="#!' + levels[current_level]['short_name'] + '">Next Lesson</a>';
    } else {
      is_correct_html += 'That is currently the end of the tutorial.  Please check back later for more!';
    }
    $('#answer-correctness').html(is_correct_html);
  } else {
    $('#answer-correctness').text('That was incorrect.  Please try again.');
  }
  $('#answer-correctness').show();
};

// Onclick handler for when you click "Run SQL"
$('#sql-link').click(function() {
  var answer = levels[current_level - 1]['answer'];
  try {
    var results = db.exec($('#sql-input').val());
    $('#results').html(table_from_results(results));
    show_is_correct(grade_results(results, answer));
  } catch (err) {
    $('#results').html('');
    show_is_correct(false);
  }
  $('.expected-results-container').show();
  $('#expected-results').html(table_from_results([answer]));
  return false;
});

// Stores the prompts and answers for each level
var levels = [{'name': 'SELECT *',
               'short_name': 'select',
               'database_type': 'family',
               'answer': {'columns': ['id', 'name', 'gender', 'species', 'age'],
                           'values': [[1, 'Dave', 'male', 'human', 28],
                                      [2, 'Mary', 'female', 'human', 27],
                                      [3, 'Pickles', 'male', 'dog', 4]]},
               'prompt': 'In SQL, data is usually organized in various tables. For example, a sports team database might have the tables <i>teams</i>, <i>players</i>, and <i>games</i>. A wedding database might have tables <i>guests</i>, <i>vendors</i>, and <i>music_playlist</i>.<br/><br/>Imagine we have a table that stores family members with each member\'s name, age, species, and gender.<br/><br/>Let\'s start by grabbing all of the data in one table.  We have a table called <strong>family_members</strong> that is shown below.  In order to grab all of that data, please run the following command: <code>SELECT * FROM family_members;</code>'},

              {'name': 'WHERE ... Equals',
               'short_name': 'where_equals',
               'database_type': 'family',
               'answer': {'columns': ['id', 'name', 'gender', 'species', 'age'],
                          'values': [[3, 'Pickles', 'male', 'dog', 4]]},
               'prompt': 'In order to select particular rows from this table, we use the <code>WHERE</code> keyword.  So for example, if we wanted to grab all of the rows that correspond to humans, we would type <br/><code>SELECT * FROM family_members WHERE species = \'human\';</code><br/>  Note that the quotes have to be around the word human.<br/><br/>Can you run a query that returns all of the rows that refer to dogs?'},

              {'name': 'WHERE ... Greater than',
               'short_name': 'where_greater_than',
               'database_type': 'family',
               'answer': {'columns': ['id', 'name', 'gender', 'species', 'age'],
                          'values': [[1, 'Dave', 'male', 'human', 28]]},
               'prompt': 'If we want to only select family members based on a numerical field, we can also use the <code>WHERE</code> keyword.  For example, if we wanted to select family members older than 10, we would type <br/><code>SELECT * FROM family_members WHERE age > 10;</code><br/><br/>  Can you run return all rows of members with age greater than 27?'},

              {'name': 'WHERE ... Greater than or equal',
               'short_name': 'where_greater_than_or_equal',
               'database_type': 'family',
               'answer': {'columns': ['id', 'name', 'gender', 'species', 'age'],
                          'values': [[2, 'Mary', 'female', 'human', 27],
                                     [3, 'Pickles', 'male', 'dog', 4]]},
               'prompt': 'SQL accepts various inequality symbols, including: <br/>= "equal to"<br/>> "greater than"<br/>< "less than"<br/>>= "greater than or equal to"<br/><= "less than or equal to"<br/><br/> Can you return all rows in <strong>family_members</strong> with an age less than or equal to 27?'},

              {'name': 'SELECT specific columns',
               'short_name': 'select_columns',
               'database_type': 'family',
               'answer': {'columns': ['name', 'species'],
                          'values': [['Dave', 'human'],
                                     ['Mary', 'human'],
                                     ['Pickles', 'dog']]},
               'prompt': '<code>SELECT *</code> grabs all fields (called columns) in a table. If we only wanted to see the name and age columns, we would type<br/> <code>SELECT name, age from family_members;</code>.<br/><br/>Can you return just the name and species columns?'},

              {'name': 'LIMIT # of returned rows',
               'short_name': 'limit',
               'database_type': 'family',
               'answer': {'columns': ['id', 'name', 'gender', 'species', 'age'],
                          'values': [[1, 'Dave', 'male', 'human', 28]]},
               'prompt': 'Often, tables contain millions of rows, and it can take a while to grab everything. If we just want to see a few examples of the data in a table, we can select only a few rows. If we want to select 2 rows, we would add <code>LIMIT 2</code> at the end of the query.<br/><br/> Can you return just the first row (and all columns) of <strong>family_members</strong>?'},

              {'name': 'COUNT(*)',
               'short_name': 'count',
               'database_type': 'family',
               'answer': {'columns': ['COUNT(*)'],
                          'values': [[3]]},
               'prompt': 'Another way to explore a table is to check the number of rows in it. For example, if we are querying a table <i>states_of_us</i> we\'d expect 50 rows, or 500 rows in a table called <i>fortune_500_companies</i>.<br/><br/><code>SELECT COUNT(*) FROM family_members;</code> returns the total number of rows in the table <strong>family_members</strong>. Try this for yourself.'},

              {'name': 'COUNT(*) ... WHERE',
               'short_name': 'count_where',
               'database_type': 'family',
               'answer': {'columns': ['COUNT(*)'],
                          'values': [[1]]},
               'prompt': 'We can combine <code>COUNT(*)</code> with <code>WHERE</code>.<br/><br/> For example, <code>SELECT COUNT(*) FROM family_members WHERE species = \'human\';</code> returns 2.<br/><br/>Can you return the number of rows in <strong>family_members</strong> where the species is a dog?'},

              {'name': 'NULL',
               'short_name': 'null',
               'database_type': 'family_null',
               'answer': {'columns': ['id', 'name', 'gender', 'species', 'age', 'favorite_book'],
                          'values': [[1, 'Dave', 'male', 'human', 28, 'To Kill a Mockingbird'],
                                     [2, 'Mary', 'female', 'human', 27, 'Gone with the Wind']]},
               'prompt': 'Sometimes, in a given row, there is no value at all for a given column.  For example, a dog does not have a favorite book, so in that case there is no point in putting a value in the <i>favorite_book</i> column, and the value is <code>NULL</code>.  In order to find the rows where the value for a column is or is not <code>NULL</code>, you would use <code>IS NULL</code> or <code>IS NOT NULL</code>.<br/><br/>Can you return all of the rows of <strong>family_members</strong> where <i>favorite_book</i> is not null?'},

              {'name': 'Date',
               'short_name': 'date',
               'database_type': 'celebs_born',
               'answer': {'columns': ['id', 'name', 'birthdate'],
                          'values': [[2, 'Justin Timberlake', '1981-01-31'],
                                     [3, 'Taylor Swift', '1989-12-13']]},
               'prompt': 'Sometimes, a column can contain a date value.  The first 4 digits represents the year, the next 2 digits represents the month, and the next 2 digits represents the day of the month.  For example, <code>1985-07-20</code> would mean July 20, 1985.<br/><br/>You can compare dates by using <code><</code> and <code>></code>.  For example, <code>SELECT * FROM celebs_born WHERE birthdate < \'1985-08-17\';</code> returns a list of celebrities that were born before August 17th, 1985.<br/><br/>Can you return a list of celebrities that were born after September 1st, 1980?'},

              {'name': 'Joins',
               'short_name': 'joins',
               'database_type': 'tv',
               'answer': {'columns': ['id', 'name', 'id', 'character_id', 'actor_name'],
                          'values': [[1, 'Doogie Howser', 4, 1, 'Neil Patrick Harris'],
                                     [2, 'Barney Stinson', 3, 2, 'Neil Patrick Harris'],
                                     [3, 'Lily Aldrin', 2, 3, 'Alyson Hannigan'],
                                     [4, 'Willow Rosenberg', 1, 4, 'Alyson Hannigan']]},
               'prompt': 'Different parts of information can be stored in different tables, and in order to put them together, we use <code>JOIN ... ON</code>. Joining tables gets to the core of SQL functionality, but it can get very complicated. We will start with a simple example.<br/><br/>As you can see below, there are 3 tables:<br/><strong>character</strong>: Each character is a row and is represented by a unique identifier (<i>id</i>), e.g. 1 is Doogie Howser<br/><strong>character_tv_show:</strong> For each character, which show is he/she in?<br/><strong>character_actor</strong>: For each character, who is the actor?<br/><br/>See that in <strong>character_tv_show</strong>, instead of storing both the character and TV show names (e.g. Willow Rosenberg and Buffy the Vampire Slayer), it stores the <i>character_id</i> as a substitute for the character name. This <i>character_id</i> refers to the matching <i>id</i> row from the <strong>character</strong> table. <br/><br/>This is done so data is not duplicated.  For example, if the name of a character were to change, you would only have to change the name of the character in one row. <br/><br/>This allows us to "join" the tables together "on" that reference/common column. <br/><br/>To get each character name with his/her TV show name, we can write <br/><code>SELECT *<br/> FROM character <br/>JOIN character_tv_show<br/> ON character.id = character_tv_show.character_id;</code><br/>This puts together every row in <strong>character</strong> with the corresponding row in <strong>character_tv_show</strong>, or vice versa.<br/><br/>Notice:<br/>- We use the syntax <strong>table_name</strong>.<i>column_name</i>. If we only used <i>column_name</i>, SQL might incorrectly assume which table it is coming from.<br/>- <code>SELECT *</code> selects all columns from both tables.<br/><br/>Can you use a join to pair each  character name with the actor who plays them? (Select all columns.)'}
              ];


// Create the SQL database
var load_database = function(db_type) {
  var database, sqlstr, results;
  switch (db_type) {
    case 'family':
      database = new sql.Database();
      sqlstr = "CREATE TABLE family_members (id int, name char, gender char, species char, age int);";
      sqlstr += "INSERT INTO family_members VALUES (1, 'Dave', 'male', 'human', 28);";
      sqlstr += "INSERT INTO family_members VALUES (2, 'Mary', 'female', 'human', 27);";
      sqlstr += "INSERT INTO family_members VALUES (3, 'Pickles', 'male', 'dog', 4);";
      database.run(sqlstr);
      results = database.exec("SELECT * FROM family_members;");
      $('#current-tables').html('<div class="table-name">family_members</div>' + table_from_results(results));
      return database;
    case 'family_null':
      database = new sql.Database();
      sqlstr = "CREATE TABLE family_members (id int, name char, gender char, species char, age int, favorite_book char);";
      sqlstr += "INSERT INTO family_members VALUES (1, 'Dave', 'male', 'human', 28, 'To Kill a Mockingbird');";
      sqlstr += "INSERT INTO family_members VALUES (2, 'Mary', 'female', 'human', 27, 'Gone with the Wind');";
      sqlstr += "INSERT INTO family_members VALUES (3, 'Pickles', 'male', 'dog', 4, NULL);";
      database.run(sqlstr);
      results = database.exec("SELECT * FROM family_members;");
      $('#current-tables').html('<div class="table-name">family_members</div>' + table_from_results(results));
      return database;
    case 'celebs_born':
      database = new sql.Database();
      sqlstr = "CREATE TABLE celebs_born (id int, name char, birthdate date);";
      sqlstr += "INSERT INTO celebs_born VALUES (1, 'Michael Jordan', '1963-02-17');";
      sqlstr += "INSERT INTO celebs_born VALUES (2, 'Justin Timberlake', '1981-01-31');";
      sqlstr += "INSERT INTO celebs_born VALUES (3, 'Taylor Swift', '1989-12-13');";
      database.run(sqlstr);
      results = database.exec("SELECT * FROM celebs_born;");
      $('#current-tables').html('<div class="table-name">celebs_born</div>' + table_from_results(results));
      return database;
    case 'tv':
      database = new sql.Database();
      sqlstr = "CREATE TABLE character (id int, name char);";
      sqlstr += "INSERT INTO character VALUES (1, 'Doogie Howser');";
      sqlstr += "INSERT INTO character VALUES (2, 'Barney Stinson');";
      sqlstr += "INSERT INTO character VALUES (3, 'Lily Aldrin');";
      sqlstr += "INSERT INTO character VALUES (4, 'Willow Rosenberg');";
      sqlstr += "CREATE TABLE character_tv_show (id int, character_id int, tv_show_name char);";
      sqlstr += "INSERT INTO character_tv_show VALUES (1, 4, 'Buffy the Vampire Slayer');";
      sqlstr += "INSERT INTO character_tv_show VALUES (2, 3, 'How I Met Your Mother');";
      sqlstr += "INSERT INTO character_tv_show VALUES (3, 2, 'How I Met Your Mother');";
      sqlstr += "INSERT INTO character_tv_show VALUES (4, 1, 'Doogie Howser, M.D.');";
      sqlstr += "CREATE TABLE character_actor (id int, character_id int, actor_name char);";
      sqlstr += "INSERT INTO character_actor VALUES (1, 4, 'Alyson Hannigan');";
      sqlstr += "INSERT INTO character_actor VALUES (2, 3, 'Alyson Hannigan');";
      sqlstr += "INSERT INTO character_actor VALUES (3, 2, 'Neil Patrick Harris');";
      sqlstr += "INSERT INTO character_actor VALUES (4, 1, 'Neil Patrick Harris');";
      database.run(sqlstr);
      table_html = '<div class="table-name">character</div>' + table_from_results(database.exec("SELECT * FROM character;"));
      table_html += '<div class="table-name">character_tv_show</div>' + table_from_results(database.exec("SELECT * FROM character_tv_show;"));
      table_html += '<div class="table-name">character_actor</div>' + table_from_results(database.exec("SELECT * FROM character_actor;"));
      $('#current-tables').html(table_html);
      return database;
  }
};

var current_level;
var current_level_name;

var load_level = function() {
  var hash_code = window.location.hash.substr(2);
  // The current level is 1 by default, unless the hash code matches the short name for a level.
  current_level = 1;
  for (var index in levels) {
    if (hash_code == levels[index]['short_name']) {
      current_level = parseInt(index, 10) + 1;
      break;
    }
  }
  var database = load_database(levels[current_level-1]['database_type']);
  // Set text for current level
  lesson_name = levels[current_level-1]['name'];
  $('#lesson-name').text("Lesson " + current_level + ": " + lesson_name);
  $('#prompt').html(levels[current_level-1]['prompt']);

  // Add "next" and "previous" links if it makes sense.
  if (current_level > 1) {
    $('#previous-link').attr('href', '#!' + levels[current_level-2]['short_name']);
    $('#previous-link').show();
  } else {
    $('#previous-link').hide();
  }
  if (current_level < levels.length) {
    $('#next-link').attr('href', '#!' + levels[current_level]['short_name']);
    $('#next-link').show();
  } else {
    $('#next-link').hide();
  }

  // Add links to menu
  var menu_html = '';
  for (var index in levels) {
    if (index == (current_level - 1)) {
      menu_html += '<strong>';
    }
    menu_html += '<a class="menu-link" href="#!' + levels[index]['short_name'] + '">' + levels[index]['name'] + '</a>';
    if (index == (current_level - 1)) {
      menu_html += '</strong>';
    }
  }
  $('.menu').html(menu_html);

  // Clear out old data
  $('#answer-correctness').hide();
  $('#sql-input').val('');
  $('#results').html('');
  $('.expected-results-container').hide();
  return database;
};
db = load_level();

// When the URL after the # changes, we load a new level,
// and let Google Analytics know that the page has changed.
$(window).bind('hashchange', function() {
  db = load_level();
  ga('send', 'pageview', {'page': location.pathname + location.search  + location.hash});
});
