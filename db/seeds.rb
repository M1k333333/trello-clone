# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

user = User.create!(email: "user@email.com", password: "password", password_confirmation: "password")

10.times do
  User.create(email: Faker::Internet.email, password: "password", password_confirmation: "password")
end

6.times do |i|
  Board.create(name: "Board #{i + 1}", user: user)
end

Board.find_each do |board|
  6.times { |i| List.create(board: board, title: "List #{i + 1}", position: i) }

  board.reload.lists.each do |list|
    6.times { |i| Item.create(list: list, title: "Item #{i + 1}", description: "Description for Item: #{i + 1}") }
  end
end
