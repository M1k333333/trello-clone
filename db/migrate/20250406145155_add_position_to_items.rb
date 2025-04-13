class AddPositionToItems < ActiveRecord::Migration[8.0]
  def change
    add_column :items, :position, :integer, null: false, default: 0
  end
end
